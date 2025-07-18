import crypto from 'node:crypto';
import https from 'node:https';
import tls, { PeerCertificate } from 'node:tls';

import { ConnectionOptions } from 'tls';

import { MainClient } from '../src/index';
import { getTestProxy } from './proxy.util';
import { notAuthenticatedError } from './response.util';

// Expected pinned public key (SPKI SHA-256 hash)
// You can extract it from the certificate using openssl:
// openssl s_client -connect api.binance.com:443 </dev/null 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
const PINNED_PUBLIC_KEY = '8f+yoE6YBsp3ftzgATuaWqQiZna/x30yVX676Ky7lxY=';

// Load the trusted CA certificate (optional but recommended)
// import fs from 'fs';
// const trustedCert = fs.readFileSync('/path/to/certificate.pem');

const certificatePinningConfiguration: ConnectionOptions = {
  // ca: trustedCert, // Ensures only the specific CA is trusted
  checkServerIdentity: (host, cert) => {
    // Make sure the certificate is issued to the host we are connected to
    const err = tls.checkServerIdentity(host, cert);
    if (err) {
      return err;
    }

    // Verify Subject Alternative Name (SAN)
    if (!cert.subjectaltname.includes('DNS:*.binance.com')) {
      throw new Error(
        `Certificate SAN mismatch: expected "*.binance.com", got ${cert.subjectaltname}`,
      );
    }
    const publicKeyHash = sha256(cert.pubkey);
    if (publicKeyHash !== PINNED_PUBLIC_KEY) {
      return new Error(
        `Certificate verification error: expected "${PINNED_PUBLIC_KEY}", got "${publicKeyHash}"`,
      );
    }

    return undefined;
  },
};

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('base64');
}

describe('Test advanced https agent configuration', () => {
  // Simple positive check for working certificate pinning while keepAlive flag is active
  describe('pinned certificate', () => {
    const api = new MainClient(
      {
        keepAlive: true,
      },
      {
        ...getTestProxy(),
        httpsAgent: new https.Agent({
          rejectUnauthorized: true,
          ...certificatePinningConfiguration,
        }),
      },
    );

    it('should throw for unauthenticated private calls', async () => {
      expect(() => api.getBalances()).rejects.toMatchObject(
        notAuthenticatedError(),
      );
    });

    it('getServerTime() should return number', async () => {
      expect(await api.getServerTime()).toStrictEqual(expect.any(Number));
    });

    it('getSystemStatus()', async () => {
      expect(await api.getSystemStatus()).toMatchObject({
        msg: 'normal',
        status: 0,
      });
    });

    it('testConnectivity()', async () => {
      expect(await api.testConnectivity()).toStrictEqual({});
    });

    it('getExchangeInfo()', async () => {
      expect(await api.getExchangeInfo()).toMatchObject({
        exchangeFilters: expect.any(Array),
        rateLimits: expect.any(Array),
        serverTime: expect.any(Number),
        symbols: expect.any(Array),
        timezone: expect.any(String),
      });
    });
  });

  describe.only('mismatching pinned certificate', () => {
    it('getServerTime() should throw since the pinned certificate did not match', async () => {
      const badPinClient = new MainClient(
        {
          keepAlive: true,
        },
        {
          // ...getTestProxy(),
          httpsAgent: new https.Agent({
            rejectUnauthorized: true,
            checkServerIdentity: (host, cert: PeerCertificate) => {
              // Make sure the certificate is issued to the host we are connected to
              const err = tls.checkServerIdentity(host, cert);
              if (err) {
                return err;
              }

              // This loop is informational only.
              // Print the certificate and public key fingerprints of all certs in the
              // chain. Its common to pin the public key of the issuer on the public
              // internet, while pinning the public key of the service in sensitive
              // environments.
              let lastprint256 = '';
              do {
                console.log('Subject Common Name:', cert.subject.CN);
                console.log(
                  '  Certificate SHA256 fingerprint:',
                  cert.fingerprint256,
                );

                console.log('  Public key ping-sha256:', sha256(cert.pubkey));

                lastprint256 = cert.fingerprint256;
              } while (cert.fingerprint256 !== lastprint256);

              const PINNED_PUBLIC_KEY = 'fakePublicKeyHashShouldMismatch==';
              const publicKeyHash = sha256(cert.pubkey);

              if (publicKeyHash !== PINNED_PUBLIC_KEY) {
                return new Error(
                  `Certificate verification error: expected "${PINNED_PUBLIC_KEY}", got "${publicKeyHash}"`,
                );
              }

              return undefined;
            },
          }),
        },
      );

      try {
        expect(await badPinClient.getServerTime()).toStrictEqual('');
      } catch (e) {
        expect(e?.message).toMatch(/Certificate verification error/);
      }
    });
  });
});
