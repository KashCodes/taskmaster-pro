var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: [],
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();

    // .text() will grab inner text and '.trim()' any white space before or after. -- $("textarea") tells jqUery to find all existing <textarea> el and create a new one using the textInput as the selector. It still needs to be appended tomewhere on the page.
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);

  // This will specifically swap out the <p> that was created with the new <textarea> and append it to the page.
  $(this).replaceWith(textInput);

  //the user has to click the <textarea> to begin editing. We want to highlight the input box when that starts. "Focus" can also trigger the event when clicked. We don't have a save button to update the task yet though. 
  textInput.trigger("focus");

  // We can revert the <textarea> back when it goes out of focus in lieu of a 'Save' button. The blur 'trigger; event will activate as soon as the user interacts with anything other than the <textarea> el.
  $(".list-group").on("blur", "textarea", function() {
    // When that happens we need to collect the data of the current value of the element, the parent element's ID, and the element's position in the list. These will update the correct task in the 'tasks' object. 

    // get the textarea's current value/text
    var text = $(this)
    .val()
    .trim();

    // get the parent ul's id attribute
    var status = $(this)
    .closest(".list-group")
    .attr("id")
    //replacing the text in a string chained to the attrb "list-" followed by category name. (e.g. "toDo") to matach one of the arrays on the taks object (e.g. tasks.toDo)
    .replace("list-", "");

    // get the task's position in the list of other li elements
    var index = $(this)
    .closest(".list-group-item")
    .index();

    //Bc we don't know the values of the tasks we will use variable names as placeholders to update the overarching 'tasks' object with the new data. 
    tasks[status][index].text = text;
    saveTasks();

    /* Let's digest this one step at a time:

        tasks is an object.
        
        tasks[status] returns an array (e.g., toDo).
        
        tasks[status][index] returns the object at the given index in the array.
        
        tasks[status][index].text returns the text property of the object at the given index.
        
        Updating this tasks object was necessary for localStorage, so we call saveTasks() immediately afterwards.*/


    // convert the <textarea> back into a <p> element.
    // recreate p element
    var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

    // replace textarea with p element
    $(this).replaceWith(taskP);

  });

});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate,
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});








// load tasks for the first time
loadTasks();
