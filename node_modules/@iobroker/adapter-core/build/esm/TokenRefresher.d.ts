/**
 * Token structure
 */
export interface AccessTokens {
    /** The access token used for authentication */
    access_token: string;
    /** Interval in seconds, when access token will expire */
    expires_in: number;
    /** The date and time when the access token expires, in ISO format */
    access_token_expires_on: string;
    /** Extended expiration time in seconds, when the access token will expire */
    ext_expires_in: number;
    /** Type */
    token_type: 'Bearer';
    /** Scopes */
    scope: string;
    /** The refresh token used to obtain a new access token */
    refresh_token: string;
}
/**
 * TokenRefresher class manages OAuth2 access tokens for an ioBroker adapter.
 */
export declare class TokenRefresher {
    private readonly adapter;
    private readonly stateName;
    private refreshTokenTimeout;
    private accessToken;
    private readonly url;
    private readonly readyPromise;
    private readonly name;
    /** Threshold in milliseconds before the access token expires to trigger a refresh */
    static TOKEN_REFRESH_THRESHOLD_MS: number;
    /**
     * Creates an instance of TokenRefresher.
     *
     * @param adapter Instance of ioBroker adapter
     * @param serviceName Name of the service for which the tokens are managed, e.g., 'spotify', 'dropbox', etc.
     * @param stateName Optional name of the state where tokens are stored. Defaults to 'oauth2Tokens' and that will store tokens in `ADAPTER.X.oauth2Tokens`.
     */
    constructor(adapter: ioBroker.Adapter, serviceName: string, stateName?: string);
    private httpPost;
    private init;
    /**
     * Destroys the TokenRefresher instance, clearing any timeouts and stopping state subscriptions.
     */
    destroy(): void;
    /**
     * This method is called when the state changes for the token.
     *
     * @param id ID of the state that changed
     * @param state Value
     */
    onStateChange(id: string, state: ioBroker.State | null | undefined): void;
    /** Returns the access token if it is valid and not expired.*/
    getAccessToken(): Promise<string | undefined>;
    private refreshTokens;
}
