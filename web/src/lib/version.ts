export const BUILD = {
  env: process.env.NEXT_PUBLIC_ENV ?? 'dev',
  sha: process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'dev',
  builtAt: process.env.NEXT_PUBLIC_BUILD_AT ?? '',
};
