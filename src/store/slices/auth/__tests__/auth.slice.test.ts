import { describe, expect, it } from "vitest";
import reducer, { setKeycloakAuth } from "../auth.slice";
import { authLogout, authMe, authSignIn } from "../auth.thunk";

const user = { id: 1, username: "ann" };
const initial = () => reducer(undefined, { type: "@@init" });

describe("auth thunks", () => {
  it("use the auth prefix, not config", () => {
    expect(authSignIn.typePrefix).toBe("auth/signIn");
    expect(authMe.typePrefix).toBe("auth/me");
    expect(authLogout.typePrefix).toBe("auth/logout");
  });
});

describe("auth slice", () => {
  it("starts logged out", () => {
    expect(initial()).toEqual({ loggedIn: false });
  });

  it("signIn stores the answer", () => {
    const state = reducer(
      initial(),
      authSignIn.fulfilled({ loggedIn: true, user }, "req", {} as any),
    );
    expect(state).toEqual({ loggedIn: true, user });
  });

  it("me merges: fields the answer omits are kept", () => {
    const signedIn = reducer(initial(), setKeycloakAuth({ loggedIn: true, user }));
    const next = reducer(signedIn, authMe.fulfilled({ loggedIn: false }, "req"));
    expect(next).toEqual({ loggedIn: false, user });
  });

  it("logout clears the user", () => {
    const signedIn = reducer(initial(), setKeycloakAuth({ loggedIn: true, user }));
    const next = reducer(signedIn, authLogout.fulfilled(null, "req"));
    expect(next.loggedIn).toBe(false);
    expect(next.user).toBeUndefined();
  });

  it("setKeycloakAuth replaces login state and user", () => {
    const state = reducer(initial(), setKeycloakAuth({ loggedIn: true, user }));
    expect(state).toEqual({ loggedIn: true, user });
  });
});
