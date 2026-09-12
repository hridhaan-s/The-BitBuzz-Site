interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

export default {
  async fetch(request: Request, env: { ASSETS: AssetFetcher }) {
    return env.ASSETS.fetch(request);
  },
};
