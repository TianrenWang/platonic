import { JwtHelperService } from "@auth0/angular-jwt";
import { User } from "../models/user.model";

const helper = new JwtHelperService();

export const loggedIn = () => {
  return !helper.isTokenExpired(localStorage.getItem("token"));
}

export const getLoggedInUser = () => {
  let userJSON: string = localStorage.getItem("user");
  return !userJSON ? null : JSON.parse(userJSON);
}

export const userOnboarded = () => {
  let userJSON: string = localStorage.getItem("user");
  return !userJSON ? false : JSON.parse(userJSON).onboarded;
}

export const setUserOnboarded = () => {
  let userJSON: string = localStorage.getItem("user");
  let user: User = JSON.parse(userJSON);
  user.onboarded = true;
  localStorage.setItem("user", JSON.stringify(user));
}
