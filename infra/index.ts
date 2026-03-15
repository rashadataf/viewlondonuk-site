import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();
const isProduction = pulumi.getStack() === "prod";

// ── Config ────────────────────────────────────────────────────────────────────
const httpPort             = config.get("HTTP_PORT")              ?? "80";
const httpsPort            = config.get("HTTPS_PORT")             ?? "443";
const domainName           = config.get("DOMAIN_NAME")            ?? "localhost";
const adminEmail           = config.requireSecret("ADMIN_EMAIL");

const siteImageName        = config.get("SITE_IMAGE_NAME")        ?? "viewlondonuk/site";
const appPort              = config.get("APP_PORT")               ?? "3010";
const siteBuildContext     = config.get("SITE_BUILD_CONTEXT")     ?? "../site";
const siteWorkdirPath      = config.get("SITE_WORKDIR_PATH")      ?? "/site";
const siteImageTag         = config.get("SITE_IMAGE_TAG")         ?? "latest";
const siteBuildPhaseTarget = config.get("SITE_BUILD_PHASE_TARGET") ?? "development";

const enableTls            = config.getBoolean("ENABLE_TLS")      ?? false;
const protocol             = config.get("PROTOCOL")               ?? "http";
const routerEntrypoint     = config.get("ROUTER_ENTRYPOINT")      ?? "web";
const _traefikMetricsPort  = config.get("TRAEFIK_METRICS_PORT")   ?? "4318";  // reserved for future use

// Production-only network source via core stack output.
const coreStackName         = config.get("CORE_STACK_NAME");
const coreNetworkOutputKey   = config.get("CORE_NETWORK_OUTPUT_KEY") ?? "appNetworkName";

// ── Computed variables ────────────────────────────────────────────────────────
const appNetworkName         = `${pulumi.getProject()}-network`;
const frontendContainerName  = `${pulumi.getProject()}-viewlondonuk-${pulumi.getStack()}`;
const traefikAlias           = "traefik";

// ── Resources ─────────────────────────────────────────────────────────────────

const appNetwork = isProduction ? undefined : new docker.Network("appNetwork", {
    name: appNetworkName,
});

const traefikData = isProduction ? undefined : new docker.Volume("traefikData", {
    name: "traefik-data",
});

const nextBuildVolume = new docker.Volume("nextBuildVolume", {
    name: "site_next_build",
});

const traefikImage = isProduction ? undefined : new docker.RemoteImage("traefikImage", {
    name: "traefik:v2.11",
});

const traefik = isProduction ? undefined : new docker.Container("traefik", {
    name: `${pulumi.getProject()}-traefik-${pulumi.getStack()}`,
    image: traefikImage!.imageId,
    restart: "always",
    ports: [
        { internal: parseInt(httpPort),  external: parseInt(httpPort) },
        { internal: parseInt(httpsPort), external: parseInt(httpsPort) },
        { internal: 8080,                external: 8080 },
    ],
    envs: [
        "TRAEFIK_PROVIDERS_DOCKER=true",
        "TRAEFIK_PROVIDERS_DOCKER_EXPOSEDBYDEFAULT=false",
        `TRAEFIK_PROVIDERS_DOCKER_NETWORK=${appNetworkName}`,
        `TRAEFIK_ENTRYPOINTS_WEB_ADDRESS=:${httpPort}`,
        `TRAEFIK_ENTRYPOINTS_WEBSECURE_ADDRESS=:${httpsPort}`,
        pulumi.interpolate`TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_EMAIL=${adminEmail}`,
        "TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_STORAGE=/data/acme.json",
        "TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_HTTPCHALLENGE_ENTRYPOINT=web",
    ],
    mounts: [
        {
            type: "bind",
            source: "/var/run/docker.sock",
            target: "/var/run/docker.sock",
            readOnly: true,
        },
        {
            type: "volume",
            source: traefikData!.name,
            target: "/data",
        },
    ],
    networksAdvanced: [
        { name: appNetworkName, aliases: [traefikAlias] },
    ],
});

let siteNetworkName: pulumi.Input<string>;

if (!isProduction) {
    siteNetworkName = appNetworkName;
} else {
    if (!coreStackName) {
        throw new pulumi.RunError(
            "For prod stack, set CORE_STACK_NAME.",
        );
    }

    const coreStackRef = new pulumi.StackReference(coreStackName);
    siteNetworkName = coreStackRef.requireOutput(coreNetworkOutputKey).apply((value) => {
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new pulumi.RunError(
                `Output '${coreNetworkOutputKey}' from stack '${coreStackName}' must be a non-empty string network name.`,
            );
        }
        return value;
    });
}

const siteImage = new docker.RemoteImage("siteImage", {
    name: `${siteImageName}:${siteImageTag}`,
    build: {
        context: siteBuildContext,
        buildArgs: { SITE_WORKDIR_PATH: siteWorkdirPath },
        target: siteBuildPhaseTarget,
    },
});

const siteContainer = new docker.Container("siteContainer", {
    name: frontendContainerName,
    image: siteImage.imageId,
    restart: "always",
    envs: [
        `PORT=${appPort}`,
        `DOMAIN_NAME=${domainName}`,
        `PROTOCOL=${protocol}`,
    ],
    mounts: [
        {
            type: "bind",
            source: `${process.cwd()}/../site`,
            target: siteWorkdirPath,
        },
        {
            type: "volume",
            source: nextBuildVolume.name,
            target: `${siteWorkdirPath}/.next`,
        },
    ],
    networksAdvanced: [{ name: siteNetworkName }],
    labels: [
        { label: "traefik.enable",                                              value: "true" },
        { label: "traefik.http.services.site.loadbalancer.server.port",         value: appPort },
        { label: "traefik.http.routers.site.entrypoints",                       value: routerEntrypoint },
        { label: "traefik.http.routers.site.rule",                              value: `Host(\`${domainName}\`)` },
        { label: "traefik.http.routers.site.tls",                               value: String(enableTls) },
        { label: "traefik.http.routers.site.tls.certresolver",                  value: "letsencrypt" },
    ],
}, !isProduction && traefik ? { dependsOn: [traefik] } : undefined);

// ── Outputs ───────────────────────────────────────────────────────────────────
export const siteHost           = domainName;
export const appNetworkNameOut  = siteNetworkName;
export const routerEntrypointOut = routerEntrypoint;
export const enableTlsOut       = enableTls;
export const protocolOut        = protocol;
export const isProductionOut    = isProduction;
