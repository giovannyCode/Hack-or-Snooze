"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {

 const hostName = story.getHostName();
 if(currentUser=== undefined)
  {
    return $(`
      <li id="${story.storyId}">
       <a href="${story.url}" target="a_blank" class="story-link"> ${story.title} </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  }
  else
  {
    const storyId = story.storyId;
    const isStoryaFavorite  = currentUser.favorites.some(u => u.storyId ==storyId)
    const isOwnStory = currentUser.ownStories.some(u => u.storyId ==storyId)
    return $(`
      <li id="${story.storyId}">
     <span >
      <i class="${isStoryaFavorite ==true ? "fa-star fas": "far fa-star"}"></i>
     </span> 
       <a href="${story.url}" target="a_blank" class="story-link"> ${story.title} </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author} ${isOwnStory== true ?`<span class="trash"> <i class="fas fa-trash fa-xs"></i></span>`:"" }
        <small class="story-user">posted by ${story.username}</small> 
          </li>
    `);
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function createStory(evt) {
  console.debug("createStory", evt);
  evt.preventDefault();
  const author = $("#Author").val();
  const title = $("#Tittle").val();
  const url = $("#Url").val();
  const story = new Story({author:author,title:title,url:url }) ;
  const newStory = await storyList.addStory(currentUser,story);
  currentUser.ownStories.push(newStory);
  console.log(newStory);
  $storySubmitForm.hide();
  await getAndShowStoriesOnStart();
  $storySubmitForm[0].reset();
}

$storySubmitForm.on("submit", createStory);

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");
  $favoriteStoryList.empty();
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoryList.append($story);
  }
  $favoriteStoryList.show();
}


function putOwnStoriesOnPage() {
  console.debug("putOwnStoriesOnPage");
  $ownStorieslist.empty();
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $ownStorieslist.append($story);
  }
   $ownStorieslist.show();
}