import net from 'node:net';

import { MainClient } from '../src';

describe('REST transport', () => {
  it('preserves cause and code when the connection is refused', async () => {
    const client = new MainClient({
      baseUrl: 'http://127.0.0.1:1',
      disableTimeSync: true,
    });

    await expect(client.testConnectivity()).rejects.toMatchObject({
      code: 'ECONNREFUSED',
      cause: expect.objectContaining({ code: 'ECONNREFUSED' }),
    });
  });

  it('opens an HTTPS proxy tunnel with CONNECT', async () => {
    let requestLine = '';
    const server = net.createServer((socket) => {
      socket.once('data', (buf) => {
        requestLine = buf.toString('utf8').split('\r\n')[0];
        socket.end('HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n');
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('proxy fixture did not bind a port');
    }

    const client = new MainClient(
      { disableTimeSync: true },
      {
        timeout: 3000,
        proxy: {
          host: '127.0.0.1',
          port: address.port,
          protocol: 'http',
        },
      },
    );

    try {
      await expect(client.testConnectivity()).rejects.toBeTruthy();
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }

    expect(requestLine.startsWith('CONNECT ')).toBe(true);
    expect(requestLine).toContain(':443');
  });
});
