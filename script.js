//select elements
const faqList = document.getElementById("faq-list");

//app state
const state = {
  errorMessage: "",
  questions: {},
  arrowIndex: undefined, //arrow keys navigation
  clickIndex: undefined, //mouse click navigation
  expandedIndex: undefined, //
  faqPanelsListStore: [],
  faqToggleIconsListStore: [],
  faqToggleButtonsListStore: [],
};

//event listeners

//windows load - initiation
window.addEventListener("load", init);

//click on the list elements via event delegation
faqList.addEventListener("click", clickNavigation);

//event listener for the arrow keys keyboard navigation
document.addEventListener("keydown", arrowNavigation);

//event listeners callback functions

/**
 * application initiation funcion
 */
async function init() {
  //get the data
  const { questions } = await getData();

  //update the app state
  state.questions = questions;

  let listInnerHTML = "";

  //loop over the questions
  for (let i = 0; i < state.questions.length; i++) {
    //for each question - add a Question component to the faq list inner html
    listInnerHTML += QuestionComponent({
      question: state.questions[i].question,
      answer: state.questions[i].answer,
      key: i,
    });

    //add a divider after each question expecpt for the last question
    if (i < state.questions.length - 1) {
      listInnerHTML += Divider();
    }
  }

  //assign the inner html
  faqList.innerHTML = listInnerHTML;

  //select all the panels and store them inside the state to reuse them on toggle
  state.faqPanelsListStore = faqList.querySelectorAll(".answer-panel");

  //select all the faq icons and store them inside the state to reuse them on toggle
  state.faqToggleIconsListStore = faqList.querySelectorAll(
    ".expand-collapse-icon"
  );

  //select all the buttons and store them inside the state to reuse them on arrow navigation
  state.faqToggleButtonsListStore =
    faqList.querySelectorAll(".question-trigger");
}

/**
 * function to expand/collapse faq list element answer panel with click
 * @param event - click event on the form
 */
function clickNavigation(event) {
  //closest toggle button
  const closestButton = event.target.closest(".question-trigger");

  // reset - close all panels and remove marked classes
  resetAccordion();

  if (closestButton) {
    //select the parent list element
    const faqItem = closestButton.closest(".faq-item");

    //update the click index // faq-item-index
    state.clickIndex = faqItem.id.split("-").at(-1);

    //toggle - expand/collapse
    togglePanel(state.clickIndex);
  }
}

/**
 * function for keyboard navigation on key down
 * up and down keys
 * start with item 0 for down key initial press
 * start with the last item for up key initial press
 * enter press toggles the current answer panel
 */
function arrowNavigation(event) {
  //key codes
  const upArrowKeyCode = 38; //moves up
  const downArrowKeyCode = 40; //moves down
  const enterKeyCode = 13; //toggles

  // reset - close all panels and remove marked classes
  resetAccordion();

  //watch for up and down
  if (event.keyCode === upArrowKeyCode || event.keyCode === downArrowKeyCode) {
    //arrow keys are used for navigation only
    event.preventDefault();

    //initial click - state.arrowIndex is undefined
    if (state.arrowIndex === undefined) {
      //if user presses the up arrow key - start from the last element
      if (event.keyCode === upArrowKeyCode) {
        //start from the bottom
        state.arrowIndex = state.questions.length - 1;

        //mark the last element
        markElement();
      }

      //if user presses the down arrow key - start from the first element
      if (event.keyCode === downArrowKeyCode) {
        //start from the top
        state.arrowIndex = 0;

        //mark the first element
        markElement();
      }
    } else {
      //navigation
      //up - increase index
      if (event.keyCode === downArrowKeyCode) {
        //increase the arrow index
        state.arrowIndex = (state.arrowIndex + 1) % state.questions.length;

        //mark the current element
        markElement();
      }

      //down - decrease index
      if (event.keyCode === upArrowKeyCode) {
        //decrease the arrow index
        if (state.arrowIndex === 0) {
          state.arrowIndex = state.questions.length - 1;
        } else {
          state.arrowIndex--;
        }

        //mark the current element
        markElement();
      }
    }
  }

  //watch for enter key press
  if (event.keyCode === enterKeyCode) {
    //toggle (collapse/expand) marked element - current arrow index
    togglePanel(state.arrowIndex);
  }
}

//helper functions

/**
 * function to toggle an element - expand/collapse panel
 * @param index - navigation index - either arrowIndex or clickIndex
 */
function togglePanel(index) {
  //if the clicked element is already expanded return void
  //only resetAccordion works - fake toggle
  if (index === state.expandedIndex) {
    return;
  }

  //select the indexed answer panel and toggle icon - navigated to their related question trigger button
  const answerPanel = document.getElementById(`faq-answer-${index}`);

  const toggleIcon = document.getElementById(`expand-collapse-icon-${index}`);

  //open the selected panel
  answerPanel.classList.remove("answer-collapsed");
  answerPanel.classList.add("faq-expanded");

  //update the toggle icon src to minus
  toggleIcon.setAttribute("src", "./assets/images/icon-minus.svg");

  //update the state.expandedIndex
  state.expandedIndex = index;
}

/**
 * function to manually hover the indexed element with arrow keys
 * uses the state.arrowIndex
 */
function markElement() {
  //add marked class to the current button
  state.faqToggleButtonsListStore[state.arrowIndex].classList.add("faq-marked");
}

/**
 * function to reset the accordion at the beginning of each click or key press
 */
function resetAccordion() {
  //remove the marked class from the toggle buttons and expanded class from the panels

  //get all of the buttons
  const toggleButtons = state.faqToggleButtonsListStore;

  //get all the panels
  const panels = state.faqPanelsListStore;

  //get all the icons
  const toggleIcons = state.faqToggleIconsListStore;

  //loop over the buttons
  for (let i = 0; i < toggleButtons.length; i++) {
    //remove marked class from all the buttons
    toggleButtons[i].classList.remove("faq-marked");

    //collpase all the panels
    panels[i].classList.remove("faq-expanded");
    panels[i].classList.add("answer-collapsed");

    //swap icon
    toggleIcons[i].setAttribute("src", "./assets/images/icon-plus.svg");
  }
}

/**
 * function to get the app data from the data.json file
 * @returns Promise<{questions:{question:string;answer:string}[]}>
 */
async function getData() {
  //get the questions from the json file
  const res = await fetch("./data.json");

  //check if the response is ok
  if (!res.ok) {
    state.errorMessage =
      "An unexpected error occured while trying to get the data.";

    throw new Error(state.errorMessage);
  }

  //parse the response
  const data = res.json();

  //return the data in a promise
  return data;
}

//components

/**
 * FAQ list item element
 * @param question - current question question text
 * @param answer - current question answer text
 * @param key - unique index
 */
function QuestionComponent({ question, answer, key }) {
  return `
    <!--FAQ item-->
    <li id="faq-item-${key}" class="faq-item" aria-label="faq-item-${key}" role="faq-item">
        <!--on click -> toggle expand/collapse the panel-->
        <button class="question-trigger" aria-label="faq-item-button" role="faq-item-button">
            <!--question-->
            <h3>${question}</h3>

            <!--expand/collapse icon-->
            <div class="question-icon-container">
              <img src="./assets/images/icon-plus.svg" alt="expande/collapse icon" class="expand-collapse-icon" id="expand-collapse-icon-${key}" /> 
            </div>
        </button>

        <!--hidden panel-->
        <div class="answer-panel faq-collapsed" id="faq-answer-${key}" aria-label="faq-item-accordion-panel" role="faq-item-accordion-panel">
            <!--answer-->
            <p>${answer}</p>
        </div>
    </li>
    `;
}

/**
 * Divider Component - after list elements except for the last one
 */
function Divider() {
  return `<hr />`;
}
