import * as logging from "../../src/logging";
import { pathsToModuleNameMapper } from "../../src/typescript/ts-jest-utils";

const tsconfigMap = {
  log: ["src/utils/log"],
  server: ["src/server"],
  client: ["src/client", "src/client/index"],
  "util/*": ["src/utils/*"],
  "api/*": ["src/api/*"],
  "test/*": ["test/*"],
  "mocks/*": ["test/mocks/*"],
  "test/*/mock": ["test/mocks/*", "test/__mocks__/*"],
  "@foo-bar/common": ["../common/dist/library"],
  "@pkg/*": ["./packages/*"],
};

describe("pathsToModuleNameMapper", () => {
  test("should convert tsconfig mapping with no given prefix", () => {
    expect(pathsToModuleNameMapper(tsconfigMap)).toMatchInlineSnapshot(`
      {
        "^@foo\\-bar/common$": "../common/dist/library",
        "^@pkg/(.*)$": "./packages/$1",
        "^api/(.*)$": "src/api/$1",
        "^client$": [
          "src/client",
          "src/client/index",
        ],
        "^log$": "src/utils/log",
        "^mocks/(.*)$": "test/mocks/$1",
        "^server$": "src/server",
        "^test/(.*)$": "test/$1",
        "^test/(.*)/mock$": [
          "test/mocks/$1",
          "test/__mocks__/$1",
        ],
        "^util/(.*)$": "src/utils/$1",
      }
    `);
  });

  test("should add `js` extension to resolved config with useESM: true", () => {
    expect(
      pathsToModuleNameMapper(tsconfigMap, { useESM: true })
    ).toMatchInlineSnapshot(
      {
        "^log$": "src/utils/log",
        "^server$": "src/server",
        "^client$": ["src/client", "src/client/index"],
        "^util/(.*)\\.js$": "src/utils/$1",
        "^util/(.*)$": "src/utils/$1",
        "^api/(.*)\\.js$": "src/api/$1",
        "^api/(.*)$": "src/api/$1",
        "^test/(.*)\\.js$": "test/$1",
        "^test/(.*)$": "test/$1",
        "^mocks/(.*)\\.js$": "test/mocks/$1",
        "^mocks/(.*)$": "test/mocks/$1",
        "^test/(.*)/mock\\.js$": ["test/mocks/$1", "test/__mocks__/$1"],
        "^test/(.*)/mock$": ["test/mocks/$1", "test/__mocks__/$1"],
        "^@foo\\-bar/common$": "../common/dist/library",
        "^@pkg/(.*)\\.js$": "./packages/$1",
        "^@pkg/(.*)$": "./packages/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      `
      {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^@foo\\-bar/common$": "../common/dist/library",
        "^@pkg/(.*)$": "./packages/$1",
        "^@pkg/(.*)\\.js$": "./packages/$1",
        "^api/(.*)$": "src/api/$1",
        "^api/(.*)\\.js$": "src/api/$1",
        "^client$": [
          "src/client",
          "src/client/index",
        ],
        "^log$": "src/utils/log",
        "^mocks/(.*)$": "test/mocks/$1",
        "^mocks/(.*)\\.js$": "test/mocks/$1",
        "^server$": "src/server",
        "^test/(.*)$": "test/$1",
        "^test/(.*)/mock$": [
          "test/mocks/$1",
          "test/__mocks__/$1",
        ],
        "^test/(.*)/mock\\.js$": [
          "test/mocks/$1",
          "test/__mocks__/$1",
        ],
        "^test/(.*)\\.js$": "test/$1",
        "^util/(.*)$": "src/utils/$1",
        "^util/(.*)\\.js$": "src/utils/$1",
      }
    `
    );
  });

  test.each(["<rootDir>/", "foo"])(
    "should convert tsconfig mapping with given prefix",
    (prefix) => {
      expect(pathsToModuleNameMapper(tsconfigMap, { prefix })).toMatchSnapshot(
        prefix
      );
    }
  );

  test("should warn about mapping it cannot handle", () => {
    const warnSpy = jest.spyOn(logging, "warn");

    expect(
      pathsToModuleNameMapper({
        kept: ["src/kept"],
        "no-target": [],
        "too/*/many/*/stars": ["to/*/many/*/stars"],
      })
    ).toMatchInlineSnapshot(`
        {
          "^kept$": "src/kept",
        }
      `);

    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      'Not mapping "no-target" because it has no target.'
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Not mapping "too/*/many/*/stars" because it has more than one star (`*`).'
    );

    warnSpy.mockRestore();
  });
});
