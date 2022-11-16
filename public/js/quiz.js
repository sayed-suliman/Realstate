$(document).ready(function () {
    const questionsParentDev = $("#questions")
    $("#addNextQuiz").click(function () {
        let questionNumber = (($(".question-no").length) + (1))
        const divElement = document.createElement("div")
        divElement.className = `question-no`
        allQuestions = $(".question-no").length
        divElement.innerHTML = `
        <div class="form-group">
        <label for="question-${questionNumber}">Question ${questionNumber}</label>
        <input type="text" id="question-${questionNumber}" name="question-${questionNumber}" class="form-control">
        </div>
        <div class="form-group">
            <div class="quiz">


                <div class="d-flex">
                    <div class="options">
                        <label for="opt1-q-${questionNumber}" class="col-form-label">1</label>
                        <input id="opt1-q-${questionNumber}" type="text" class="" name="question-${questionNumber}-opt-1">
                    </div>
                    <div class="d-flex  align-items-center">
                        <input type="radio" value="" class="checkBox" name="q-${questionNumber}-op"
                        id="q-${questionNumber}-op1">
                        <label for="q-${questionNumber}-op1" class="m-0 ml-1">Correct</label>
                    </div>
                </div>
                <div class="d-flex">
                    <div class="options">
                        <label for="opt2-q-${questionNumber}" class="col-form-label">2</label>
                        <input id="opt2-q-${questionNumber}" type="text" class=""
                        name="question-${questionNumber}-opt-2">
                    </div>
                    <div class="d-flex  align-items-center">
                        <input type="radio" value="" class="checkBox" name="q-${questionNumber}-op"
                            id="q-${questionNumber}-op2">
                        <label for="q-${questionNumber}-op2" class="m-0 ml-1">Correct</label>
                    </div>
                </div>
                <div class="d-flex">
                     <div class="options">
                         <label for="opt3-q-${questionNumber}" class="col-form-label">3</label>
                         <input id="opt3-q-${questionNumber}" type="text" class=""
                               name="question-${questionNumber}-opt-3">
                    </div>
                    <div class="d-flex  align-items-center">
                         <input type="radio" value="" class="checkBox" name="q-${questionNumber}-op"
                            id="q-${questionNumber}-op3">
                        <label for="q-${questionNumber}-op3" class="m-0 ml-1">Correct</label>
                    </div>
                </div>
                <div class="d-flex">
                    <div class="options">
                        <label for="opt4-q-${questionNumber}" class="col-form-label">4</label>
                        <input id="opt4-q-${questionNumber}" type="text" class="" 
                        name="question-${questionNumber}-opt-4">
                    </div>
                    <div class="d-flex  align-items-center">
                        <input type="radio" value="" class="checkBox" name="q-${questionNumber}-op"
                            id="q-${questionNumber}-op4">
                        <label for="q-${questionNumber}-op4" class="m-0 ml-1">Correct</label>
                    </div>
                </div>


            </div>
        </div>
        `
        questionsParentDev.append(divElement)
    })
})