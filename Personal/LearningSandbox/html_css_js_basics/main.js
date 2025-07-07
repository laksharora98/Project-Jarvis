// This is a JavaScript comment.

// --- Step 1: Select elements from the DOM ---
// The DOM (Document Object Model) is the browser's representation of the HTML page.
// We use JavaScript to interact with it.

// Find the button with the ID 'changeTextBtn' and store it in a variable.
const changeTextButton = document.getElementById('changeTextBtn');

// Find the paragraph with the ID 'message' and store it in a variable.
const messageParagraph = document.getElementById('message');


// --- Step 2: Define what happens on an event ---

// We create a function that will run when the button is clicked.
function changeTheMessage() {
  // Change the text content of the paragraph.
  messageParagraph.textContent = 'Voilà! The text has been changed by JavaScript.';

  // We can also change styles. Let's make the text bold.
  messageParagraph.style.fontWeight = 'bold';
  messageParagraph.style.color = 'darkgreen';
}


// --- Step 3: Listen for the event ---

// Tell the button to listen for a 'click' event.
// When a click happens, it should execute our 'changeTheMessage' function.
changeTextButton.addEventListener('click', changeTheMessage);
