import { JwtHelperService } from "@auth0/angular-jwt";

const helper = new JwtHelperService();

export const loggedIn = () => {
  return !helper.isTokenExpired(localStorage.getItem("token"));
}

export const getLoggedInUser = () => {
  let userJSON: string = localStorage.getItem("user");
  return !userJSON ? null : JSON.parse(userJSON);
}