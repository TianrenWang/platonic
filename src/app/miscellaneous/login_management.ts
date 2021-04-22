import { JwtHelperService } from "@auth0/angular-jwt";

const helper = new JwtHelperService();

export const loggedIn = () => {
  return !helper.isTokenExpired(localStorage.getItem("token"));
}

export const logout = () =>{
  localStorage.clear();
}