"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;
const favoritesList = [];

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  putStoriesOnPage();
  document.getElementsByClassName("account-forms-container container").item(0).style.display='none';
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}
async function addFavorite(evt) {
  console.debug("addFavorite", evt);
  evt.preventDefault();

  const parentElement = evt.target.closest("li");
  console.debug("addFavorite", parentElement);
  const storyID = parentElement.getAttribute("id");
  console.debug("addFavorite", storyID);
  let token= "";
 if (!(currentUser === undefined)){
  token = currentUser.loginToken;
 }
  
  if (evt.target.className == "far fa-star") {
    const responsePost = await axios.post(`${BASE_URL}/users/${currentUser.username}/favorites/${storyID}`, { token });
    const responseMessagePost = responsePost.data.message;
    if (responseMessagePost == "Favorite Added!") {
      addStoryToFavorites(storyID);
      boldStarFavorite(storyID);
    }
   
  }
  else if(evt.target.className === "story-link")
  { 
    window.open(evt.target.getAttribute("href"),'_blank');

  }
  else if(evt.target.className === "fas fa-trash fa-xs")
    {
      deleteStory(evt);
    }
    else if (evt.target.className === "fa-star fas")
    {
      const responseDelete = await axios({
        url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyID}`,
        method: "DELETE",
        data: {token},
      });
      const responseMessageDelete = responseDelete.data.message;
      if (responseMessageDelete == "Favorite Removed!")
       {
         removeStoryFromFavoritesArray(storyID);
       }
    }
  else 
  {
    return;
  }
}
$allStoriesList.on("click", addFavorite);
$favoriteStoryList.on("click", addFavorite);
$ownStorieslist.on("click",addFavorite);

function addStoryToFavorites(storyID) {
  const title = document.getElementById(storyID).querySelector(".story-link").innerText;
  const author = document.getElementById(storyID).querySelector(".story-author").innerText.replace("by ", ""); 
  const url = document.getElementById(storyID).querySelector(".story-link").getAttribute("href");
  const username = document.getElementById(storyID).querySelector(".story-user").innerText.replace("posted by ", "");
  const newFavorite = new Story({
    storyId: storyID,
    title: title,
    author: author,
    url: url,
    username: username,
    createdAt: "",
  });
  currentUser.favorites.push(newFavorite);
}

function boldStarFavorite(storyId) {

  const liElements = document.querySelectorAll(`[id='${storyId}']`);
  const arrayliElements =Array.from(liElements);
  for (const iterator of arrayliElements) {
    
    const arrayiElements = Array.from(iterator.querySelectorAll("i"));
    for (const ilemennt  of arrayiElements) {
      ilemennt.classList.remove("far");
      ilemennt.classList.remove("fa-star");
      ilemennt.classList.add("fa-star");
      ilemennt.classList.add("fas");
     }
    
  }  

}
 function removeStoryFromFavoritesArray(storyID)
 {
   const indexToDelete = currentUser.favorites.findIndex(story => story.storyId===storyID);
   if (indexToDelete !== -1) {
    currentUser.favorites.splice(indexToDelete, 1);
    console.log("Object deleted successfully");
    unBoldStarFavorite(storyID);
  } else {
    console.log("Object not found");
  }

 }
 function  unBoldStarFavorite(storyID)
 {
  
  const iElements = document.querySelectorAll(`[id ='${storyID}']`);
  const iElementArray =  Array.from(iElements);
  if(iElementArray.length >0)
  { 
   
    for (const iElement of iElementArray) {
      iElement.querySelector("i").classList.remove("fa-star");
       iElement.querySelector("i").classList.remove("fas");
       iElement.querySelector("i").classList.add("far");
       iElement.querySelector("i").classList.add("fa-star");  
      
    }
  }
  
 }

 async function deleteStory(evt)
 {
  console.debug("deleteStory", evt);
  evt.preventDefault();
  if (evt.target.className == "fas fa-trash fa-xs")
  {
  
    const parentElement = evt.target.closest("li");
    const storyId = parentElement.getAttribute("id");
    const token = currentUser.loginToken;
 
  const responseDelete = await axios({
    url: `${BASE_URL}/stories/${storyId}/`,
    method: "DELETE",
    data: {token},
  });
 
  if (responseDelete.status == "200")
   {
    removeStoryFromArray(storyId,storyList.stories); //remove story from StoryList
    removeStoryFromArray(storyId,currentUser.ownStories);  //remove story from Own Stories
    removeStoryFromArray(storyId,currentUser.favorites);
    removeStoryfromStoriesContainer(storyId)
   
   }

  }

  
 }

function  removeStoryFromArray(storyId, array)
{
  const indexToDelete = array.findIndex(Story => Story.storyId === storyId);


   if (indexToDelete !== -1) {
    array.splice(indexToDelete, 1);
    console.debug("removeStoryFromArray," ,"Story  deleted successfully");
    
  } else {
    console.debug("removeStoryFromArray," ,"Object not found");
  }

}

function removeStoryfromStoriesContainer(storyId)
{
   const liElements = document.querySelectorAll(`[id='${storyId}']`);
  const arrayliElements =Array.from(liElements);
  for (const iterator of arrayliElements) {
    iterator.remove();
  }  

}


