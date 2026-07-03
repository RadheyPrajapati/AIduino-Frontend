export const isLoggedIn = () => {
    console.log("at validator " + localStorage.getItem("isLoggedIn"));
    return localStorage.getItem("isLoggedIn");
}