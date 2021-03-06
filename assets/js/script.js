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

  // check due date
  auditTask(taskLi);

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

// Audit tasks
var auditTask = function (taskEl) {
  // get date from task element and retrieve text, then trim
  var date = $(taskEl).find("span").text().trim();
  // ensure it worked
  console.log(date);

  // convert (parse) to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date
  console.log(time);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date - .isAfter is an if statement moment.js query method that performs simple true or false checks.
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  // this is for 1 day in the future, so we need to locate by using -2. To avoid confusion we are using JS Math object .abs() method to ensure we are getting absolute values and not have to use negative numbers.
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// jQuery UI Sortable //

// enable draggable/sortable feature on list-group elements
// Using the jQuery selector to find all 'list-group' elements with the <ul> tag then calling the JQuery UI sortable method on them.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  /*We've added a few more options like helper: "clone" that tells jQuery to create a copy of the dragged element and move the copy instead of the original. This is necessary to prevent click events from accidentally triggering on the original element. We also added several event listeners like activate, over, and out.*/
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event, ui) {
    // when task is moved dropover starts
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function (event, ui) {
    // when task isn't moved dropover ends
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function (event) {
    // when task is over an area .dropover-active starts
    $(event.target).addClass("dropover-active");
  },
  out: function (event) {
    // when task is out an area .dropover-active ends
    $(event.target).removeClass("dropover-active");
  },
  // changed to a jQuery 'this' log by wrapping it in '$()'
  update: function () {
    // array to store the task data in
    var tempArr = [];

    // jQuery's 'each()' loop over current set of children in sortable list, pushing text values into a new tasks array.
    $(this)
      .children()
      .each(function () {
        // jQuery's 'find()' will strip out the task's description and due date through the child DOM elements.
        // save task data to the temp array as an object
        tempArr.push({
          text: $(this).find("p").text().trim(),
          date: $(this).find("span").text().trim(),
        });
      });

    /* Use tempArr to overwrite whats currently saved in tasks object. Just like we did with the blur events. Each list id attribute matches a properon tasks. (i.e. id="list-review"). By doing this when you refresh the lists will stay in their respective columns. */

    // trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function (event) {
    $(this).removeClass("dropover");
  },
});

// jQuery Trash Drop //

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (event, ui) {
    // works like regular js remove() and will remove element entirely.
    // remove dragged element from the dom
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function (event, ui) {
    console.log(ui);
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function (event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
});

// Date Picker //

// date calender pop up feature when clicking date feilds
$("#modalDueDate").datepicker({
  // can not slect dates in the past - by passing object through .datepicker()
  minDate: 1,
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
$("#task-form-modal .btn-save").click(function () {
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

// Task was Clicked //

// when a task is clicked it can now be editted
$(".list-group").on("click", "p", function () {
  var text = $(this).text().trim();

  // .text() will grab inner text and '.trim()' any white space before or after. -- $("textarea") tells jqUery to find all existing <textarea> el and create a new one using the textInput as the selector. It still needs to be appended tomewhere on the page.
  var textInput = $("<textarea>").addClass("form-control").val(text);

  // This will specifically swap out the <p> that was created with the new <textarea> and append it to the page.
  $(this).replaceWith(textInput);

  //the user has to click the <textarea> to begin editing. We want to highlight the input box when that starts. Auto "Focus" can also trigger the event when clicked. We don't have a save button to update the task yet though.
  textInput.trigger("focus");
});

// editable field was un-focused - We can revert the <textarea> back when it goes out of focus in lieu of a 'Save' button. The blur 'trigger' event will activate as soon as the user interacts with anything other than the <textarea> el.
$(".list-group").on("blur", "textarea", function () {
  // When that happens we need to collect the data of the current value of the element, the parent element's ID, and the element's position in the list. These will update the correct task in the 'tasks' object.

  // get the textarea's current value/text
  var text = $(this).val().trim();

  // get the parent ul's id attribute
  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    //replacing the text in a string chained to the attrb "list-" followed by category name. (e.g. "toDo") to matach one of the arrays on the taks object (e.g. tasks.toDo)
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  //Bc we don't know the values of the tasks we will use variable names as placeholders to update the overarching 'tasks' object with the new data.
  // update task in array and re-save to localstorage
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
  var taskP = $("<p>").addClass("m-1").text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// Due Date Was Clicked //

/* due dates are wrapped in <span> elements that are the children of the same .list-group as the tasks. So we can delegate the click the same way we did for the <p> elements for the task text.*/
// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this).text().trim();

  //Difference between the task and date is we are creating an input el and using jQuery's attr() method to set it as a 'type="text"'.
  /* in jQuery, attr() with one argument it 'gets' with two it 'sets' - attr("1") or attr("1", "2")*/
  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    // the onClose will ensure that the date will reappear as a <span> element even if we click out the date editor without making a change. Versus it remaining a <input> element bc we tried to edit it, but did not.
    onClose: function () {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    },
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});

// Due Date Event Change Handler //

//Next we need to convert the date back to a <span>
// value of due date was changed
$(".list-group").on("change", "input[type='text']", function () {
  // get current text
  var date = $(this).val();

  // get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});

// check page for time updates every 30 mins
setInterval(function () {
  $(".card .list-group-item").each(function (index, el) {
    auditTask(el);
  });
}, 1800000);

// load tasks for the first time
loadTasks();
