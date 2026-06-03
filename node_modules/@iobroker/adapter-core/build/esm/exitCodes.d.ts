export type ExitCodes = Readonly<{
    /** Exit without error */
    NO_ERROR: number;
    /** Exit because js-controller is stopped */
    JS_CONTROLLER_STOPPED: number;
    /** Exit because Adapter config is invalid */
    INVALID_ADAPTER_CONFIG: number;
    /** Exit because no adapter config was found */
    NO_ADAPTER_CONFIG_FOUND: number;
    /** Exit because the config is invalid */
    INVALID_CONFIG_OBJECT: number;
    /** Exit because the adapter id is invalid */
    INVALID_ADAPTER_ID: number;
    /** Exit because an uncaught exception occurred */
    UNCAUGHT_EXCEPTION: number;
    /** Exit because the adapter is already running */
    ADAPTER_ALREADY_RUNNING: number;
    /** Exit because instance is disabled */
    INSTANCE_IS_DISABLED: number;
    /** Exit because directory cannot be compressed */
    CANNOT_GZIP_DIRECTORY: number;
    /** Exit because adapter directory could not be found */
    CANNOT_FIND_ADAPTER_DIR: number;
    /** Exit because adapter requested it */
    ADAPTER_REQUESTED_TERMINATION: number;
    /** Exit because the packet name is not known */
    UNKNOWN_PACKET_NAME: number;
    /** Exit because the adapters requested a rebuild */
    ADAPTER_REQUESTED_REBUILD: number;
    /** Exit because instances could not be read */
    CANNOT_READ_INSTANCES: number;
    /** Exit because only one instance is allowed globally */
    NO_MULTIPLE_INSTANCES_ALLOWED: number;
    /** Exit because only one instance is allowed on this host */
    NO_MULTIPLE_INSTANCES_ALLOWED_ON_HOST: number;
    /** Exit because no connection to objects database could be established */
    NO_CONNECTION_TO_OBJ_DB: number;
    /** Exit because no connection to states database could be established */
    NO_CONNECTION_TO_STATES_DB: number;
    /** Exit because the instance already exists */
    INSTANCE_ALREADY_EXISTS: number;
    /** Exit because the npm package could not be installed */
    CANNOT_INSTALL_NPM_PACKET: number;
    /** Exit because the zip could not be extracted */
    CANNOT_EXTRACT_FROM_ZIP: number;
    /** Exit because the io-package.json is invalid */
    INVALID_IO_PACKAGE_JSON: number;
    /** Exit because directory could not be copied */
    CANNOT_COPY_DIR: number;
    /** Exit because adapter files are missing */
    MISSING_ADAPTER_FILES: number;
    /** Exit because the npm version is invalid */
    INVALID_NPM_VERSION: number;
    /** Exit because the node version is invalid */
    INVALID_NODE_VERSION: number;
    /** Exit because the operating system is invalid */
    INVALID_OS: number;
    /** Exit because the dependency version is invalid */
    INVALID_DEPENDENCY_VERSION: number;
    /** Exit because the passed arguments are invalid */
    INVALID_ARGUMENTS: number;
    /** Exit because the password is invalid */
    INVALID_PASSWORD: number;
    /** Exit because the iobroker.json is missing */
    MISSING_CONFIG_JSON: number;
    /** Exit because a non-deletable object cannot be deleted */
    CANNOT_DELETE_NON_DELETABLE: number;
    /** Exit because states could not be retrieved */
    CANNOT_GET_STATES: number;
    /** Exit because repository list could not be retrieved */
    CANNOT_GET_REPO_LIST: number;
    /** Exit because direct restart is requested after stop */
    START_IMMEDIATELY_AFTER_STOP: number;
}>;
