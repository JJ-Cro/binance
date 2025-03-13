import { WS_KEY_MAP, WsKey } from '../../util/websockets/websocket-util';
import { FuturesExchangeInfo, NewFuturesOrderParams } from '../futures';
import { ExchangeInfo, NewSpotOrderParams, OrderResponse } from '../spot';
import {
  AccountCommissionWSAPIRequest,
  AccountStatusWSAPIRequest,
  AllOrderListsWSAPIRequest,
  AllOrdersWSAPIRequest,
  AvgPriceWSAPIRequest,
  DepthWSAPIRequest,
  ExchangeInfoWSAPIRequest,
  KlinesWSAPIRequest,
  MyAllocationsWSAPIRequest,
  MyPreventedMatchesWSAPIRequest,
  MyTradesWSAPIRequest,
  SessionLogonWSAPIRequest,
  Ticker24hrWSAPIRequest,
  TickerBookWSAPIRequest,
  TickerPriceWSAPIRequest,
  TickerTradingDayWSAPIRequest,
  TickerWSAPIRequest,
  TradesAggregateWSAPIRequest,
  TradesHistoricalWSAPIRequest,
  TradesRecentWSAPIRequest,
  UIKlinesWSAPIRequest,
} from './ws-api-requests';
import {
  AccountCommissionWSAPIResponse,
  AccountStatusWSAPIResponse,
  AggregateTradeWSAPIResponse,
  AllocationWSAPIResponse,
  AvgPriceWSAPIResponse,
  DepthWSAPIResponse,
  KlineWSAPIResponse,
  OrderListWSAPIResponse,
  OrderWSAPIResponse,
  PreventedMatchWSAPIResponse,
  RateLimitWSAPIResponse,
  TickerBookWSAPIResponse,
  TickerFullWSAPIResponse,
  TickerMiniWSAPIResponse,
  TickerPriceWSAPIResponse,
  TimeWSAPIResponse,
  TradeWSAPIResponse,
  WsAPISessionStatus,
} from './ws-api-responses';

/**
 * Standard WS commands (for consumers)
 */
export type WsOperation =
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
  | 'LIST_SUBSCRIPTIONS'
  | 'SET_PROPERTY'
  | 'GET_PROPERTY';

/**
 * WS API commands (for sending requests via WS)
 */
export const WS_API_Operations = [
  'session.logon',
  'session.status',
  'session.logout',
  //// General commands
  'ping',
  'time',
  'exchangeInfo',
  //// Market data commands //TODO:
  'depth',
  'trades.recent',
  'trades.historical',
  'trades.aggregate',
  'klines',
  'uiKlines',
  'avgPrice',
  'ticker.24hr',
  'ticker.tradingDay',
  'ticker',
  'ticker.price',
  'ticker.book',
  //// Account commands
  // Spot
  'account.status',
  'account.commission',
  'account.rateLimits.orders',
  'allOrders',
  'allOrderLists',
  'myTrades',
  'myPreventedMatches',
  'myAllocations',
  // Futures
  'v2/account.balance',
  'account.balance',
  'v2/account.status',
  //// Trading commands // TODO:
  'order.place',
  'orderList.place',
  'sor.order.place',
] as const;

export type WsAPIOperation = (typeof WS_API_Operations)[number];

export interface WsRequestOperationBinance<
  TWSTopic extends string,
  TWSParams extends object = any,
> {
  method: WsOperation | WsAPIOperation;
  params?: (TWSTopic | string | number)[] | TWSParams;
  id: number;
}

export interface WSAPIResponse<TResponseData extends object = object> {
  /** Auto-generated */
  id: string;

  status: number;
  result: TResponseData;
  rateLimits: {
    rateLimitType: 'REQUEST_WEIGHT';
    interval: 'MINUTE';
    intervalNum: number;
    limit: number;
    count: number;
  }[];

  wsKey: WsKey;
  isWSAPIResponse: boolean;
}

export type Exact<T> = {
  // This part says: if there's any key that's not in T, it's an error
  // This conflicts sometimes for some reason...
  // [K: string]: never;
} & {
  [K in keyof T]: T[K];
};

/**
 * List of operations supported for this WsKey (connection)
 */
export interface WsAPIWsKeyTopicMap {
  [WS_KEY_MAP.main]: WsOperation;
  [WS_KEY_MAP.main2]: WsOperation;
  [WS_KEY_MAP.main3]: WsOperation;

  [WS_KEY_MAP.mainTestnetPublic]: WsOperation;
  [WS_KEY_MAP.mainTestnetUserData]: WsOperation;

  [WS_KEY_MAP.marginRiskUserData]: WsOperation;
  [WS_KEY_MAP.usdm]: WsOperation;
  [WS_KEY_MAP.usdmTestnet]: WsOperation;

  [WS_KEY_MAP.coinm]: WsOperation;
  [WS_KEY_MAP.coinm2]: WsOperation;
  [WS_KEY_MAP.coinmTestnet]: WsOperation;
  [WS_KEY_MAP.eoptions]: WsOperation;
  [WS_KEY_MAP.portfolioMarginUserData]: WsOperation;
  [WS_KEY_MAP.portfolioMarginProUserData]: WsOperation;

  [WS_KEY_MAP.mainWSAPI]: WsAPIOperation;
  [WS_KEY_MAP.mainWSAPI2]: WsAPIOperation;
  [WS_KEY_MAP.mainWSAPITestnet]: WsAPIOperation;

  [WS_KEY_MAP.usdmWSAPI]: WsAPIOperation;
  [WS_KEY_MAP.usdmWSAPITestnet]: WsAPIOperation;
}

export type WsAPIFuturesWsKey =
  | typeof WS_KEY_MAP.usdmWSAPI
  | typeof WS_KEY_MAP.usdmWSAPITestnet;

/**
 * Request parameters expected per operation.
 *
 * - Each "key" here is the name of the command/operation.
 * - Each "value" here has the parameters required for the command.
 *
 * Make sure to add new topics to WS_API_Operations and the response param map too.
 */
export interface WsAPITopicRequestParamMap<TWSKey = WsKey> {
  SUBSCRIBE: never;
  UNSUBSCRIBE: never;
  LIST_SUBSCRIPTIONS: never;
  SET_PROPERTY: never;
  GET_PROPERTY: never;

  /**
   * Authentication commands & parameters:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/authentication-requests
   */
  'session.logon': SessionLogonWSAPIRequest;
  'session.status': void;
  'session.logout': void;

  /**
   * General requests & parameters:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/general-requests
   */
  ping: void;
  time: void;

  exchangeInfo: void | ExchangeInfoWSAPIRequest;

  /**
   * SPOT Market data requests & parameters:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/market-data-requests
   */
  depth: void | DepthWSAPIRequest;
  'trades.recent': void | TradesRecentWSAPIRequest;
  'trades.historical': void | TradesHistoricalWSAPIRequest;
  'trades.aggregate': void | TradesAggregateWSAPIRequest;
  klines: void | KlinesWSAPIRequest;
  uiKlines: void | UIKlinesWSAPIRequest;
  avgPrice: void | AvgPriceWSAPIRequest;
  'ticker.24hr': void | Ticker24hrWSAPIRequest;
  'ticker.tradingDay': void | TickerTradingDayWSAPIRequest;
  ticker: void | TickerWSAPIRequest;
  'ticker.price': void | TickerPriceWSAPIRequest;
  'ticker.book': void | TickerBookWSAPIRequest;

  /**
   * Account requests & parameters:
   * - Spot:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/account-requests
   *
   */

  'account.status': void | AccountStatusWSAPIRequest;

  'account.commission': void | AccountCommissionWSAPIRequest;

  'account.rateLimits.orders': void;

  allOrders: void | AllOrdersWSAPIRequest;

  allOrderLists: void | AllOrderListsWSAPIRequest;

  myTrades: void | MyTradesWSAPIRequest;

  myPreventedMatches: void | MyPreventedMatchesWSAPIRequest;

  myAllocations: void | MyAllocationsWSAPIRequest;

  /**
   * SPOT Trading requests & parameters:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/trading-requests
   */

  'order.place': (TWSKey extends WsAPIFuturesWsKey
    ? NewFuturesOrderParams
    : NewSpotOrderParams) & {
    timestamp?: number;
  };

  /**
   * User data stream:
   *
   * - Spot:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/user-data-stream-requests
   *
   * - Futures:
   * https://developers.binance.com/docs/derivatives/usds-margined-futures/account/websocket-api
   *
   * Note: for the user data stream, use the subscribe*UserDataStream() methods from the WS Client.
   */
}

/**
 * Response structure expected for each operation
 *
 * - Each "key" here is a command/request supported by the WS API
 * - Each "value" here is the response schema for that command.
 */
export interface WsAPIOperationResponseMap {
  [key: string]: unknown;

  SUBSCRIBE: never;
  UNSUBSCRIBE: never;
  LIST_SUBSCRIPTIONS: never;
  SET_PROPERTY: never;
  GET_PROPERTY: never;

  /**
   * Session authentication responses:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/session-authentication
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/authentication-requests
   */
  'session.login': WSAPIResponse<WsAPISessionStatus>;
  'session.status': WSAPIResponse<WsAPISessionStatus>;
  'session.logout': WSAPIResponse<WsAPISessionStatus>;

  /**
   * General responses:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/general-requests
   */

  ping: unknown;
  time: WSAPIResponse<TimeWSAPIResponse>;
  exchangeInfo: WSAPIResponse<FuturesExchangeInfo | ExchangeInfo>;

  /**
   * Market data responses
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/market-data-requests
   */
  depth: WSAPIResponse<DepthWSAPIResponse>;
  'trades.recent': WSAPIResponse<TradeWSAPIResponse[]>;
  'trades.historical': WSAPIResponse<TradeWSAPIResponse[]>;
  'trades.aggregate': WSAPIResponse<AggregateTradeWSAPIResponse[]>;
  klines: WSAPIResponse<KlineWSAPIResponse[]>;
  uiKlines: WSAPIResponse<KlineWSAPIResponse[]>;
  avgPrice: WSAPIResponse<AvgPriceWSAPIResponse>;
  'ticker.24hr': WSAPIResponse<
    | TickerFullWSAPIResponse
    | TickerMiniWSAPIResponse
    | TickerFullWSAPIResponse[]
    | TickerMiniWSAPIResponse[]
  >;
  'ticker.tradingDay': WSAPIResponse<
    | TickerFullWSAPIResponse
    | TickerMiniWSAPIResponse
    | TickerFullWSAPIResponse[]
    | TickerMiniWSAPIResponse[]
  >;
  ticker: WSAPIResponse<
    | TickerFullWSAPIResponse
    | TickerMiniWSAPIResponse
    | TickerFullWSAPIResponse[]
    | TickerMiniWSAPIResponse[]
  >;
  'ticker.price': WSAPIResponse<
    TickerPriceWSAPIResponse | TickerPriceWSAPIResponse[]
  >;
  'ticker.book': WSAPIResponse<
    TickerBookWSAPIResponse | TickerBookWSAPIResponse[]
  >;

  /**
   * Account responses:
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/account-requests
   */

  'account.status': WSAPIResponse<AccountStatusWSAPIResponse>;
  'account.commission': WSAPIResponse<AccountCommissionWSAPIResponse>;
  'account.rateLimits.orders': WSAPIResponse<RateLimitWSAPIResponse[]>;
  allOrders: WSAPIResponse<OrderWSAPIResponse[]>;
  allOrderLists: WSAPIResponse<OrderListWSAPIResponse[]>;
  myTrades: WSAPIResponse<TradeWSAPIResponse[]>;
  myPreventedMatches: WSAPIResponse<PreventedMatchWSAPIResponse[]>;
  myAllocations: WSAPIResponse<AllocationWSAPIResponse[]>;

  /**
   * Trading responses
   * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api/trading-requests
   */

  'order.place': WSAPIResponse<OrderResponse>;
  'orderList.place': WSAPIResponse<any>;
  'sor.order.place': WSAPIResponse<any>;

  // TODO:
}
