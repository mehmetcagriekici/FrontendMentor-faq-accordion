//select elements
const faqList = document.getElementById("faq-list");

//app state
const state = {
  errorMessage: "",
  questions: {},
  isExpanded: false,
};

//event listeners

//windows load - initiation
window.addEventListener("load", init);

//click on the list elements via event delegation
faqList.addEventListener("click", toggleFaq);

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
}

/**
 * function to expand/collapse faq list element answer panel
 * @param event - click event on the form
 */
function toggleFaq(event) {
  //closest togge button
  const closestButton = event.target.closest(".question-trigger");

  if (closestButton) {
    //select the expand/collapse icon
    const toggleIcon = closestButton.querySelector(".expand-collapse-icon");

    //select the parent list element
    const faqItem = closestButton.closest(".faq-item");

    //get the connected panel
    const answerPanel = faqItem.querySelector(".answer-panel");

    //check if the answerPanel is already expandeda
    if (answerPanel.classList.contains("faq-expanded")) {
      //close the current element
      answerPanel.classList.remove("faq-expanded");
      answerPanel.classList.add("answer-collapsed");

      //update the expanded state to false for all panels
      state.isExpanded = false;

      //convert the current icon to plus again
      toggleIcon.setAttribute("src", "./assets/images/icon-plus.svg");

      return;
    }

    //if the clicked question's panel is not already open and user clicks another question:
    //if there is an expanded question panel
    if (state.isExpanded) {
      //select all the panels
      const panels = faqList.querySelectorAll(".answer-panel");
      //select all the icons
      const toggleIcons = faqList.querySelectorAll(".expand-collapse-icon");

      //close all the panels and turn all the icons to plus
      for (let i = 0; i < panels.length; i++) {
        panels[i].classList.remove("faq-expanded");
        panels[i].classList.add("answer-collapsed");
        toggleIcons[i].setAttribute("src", "./assets/images/icon-plus.svg");
      }
    }

    //open the selected panel
    answerPanel.classList.remove("answer-collapsed");
    answerPanel.classList.add("faq-expanded");

    //update the toggle icon src to minus
    toggleIcon.setAttribute("src", "./assets/images/icon-minus.svg");

    //update expanded state to true
    state.isExpanded = true;
  }
}

//helper functions

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
 * @param isExpanded - if the answer panel is open or not
 * @param key - unique index
 */
function QuestionComponent({ question, answer, isExpanded, key }) {
  return `
    <!--FAQ item-->
    <li id="faq-item-${key}" class="faq-item">
        <!--on click -> toggle expand/collapse the panel-->
        <button class="question-trigger">
            <!--question-->
            <h3>${question}</h3>

            <!--expand/collapse icon-->
            <div class="question-icon-container">
              <img src="./assets/images/icon-plus.svg" alt="expande/collapse icon" class="expand-collapse-icon" id="expand-collapse-icon-${key}" /> 
            </div>
        </button>

        <!--hidden panel-->
        <div class="answer-panel faq-collapsed" id="faq-answer-${key}">
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
