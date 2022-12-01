$(document).ready(function () {
    const questionsParentDev = $("#questions")
    $("#addNextQuiz").click(function () {
        let questionNumber = (($(".question-no").length) + (1))
        console.log(questionNumber)
        const divElement = document.createElement("div")
        divElement.className = `question-no`
        allQuestions = $(".question-no").length
        divElement.innerHTML = `
        <div class="form-group">
        <label for="question-${questionNumber}" class="w-100">
            Question ${questionNumber}
            <button type="button" class="btn p-0 float-right cross">x</button>
        </label>
        <input type="text" required id="question-${questionNumber}" name="question-${questionNumber}" class="form-control">
        </div>
        <div class="form-group">
            <div class="quiz">


                <div class="d-flex">
                    <div class="options">
                        <label for="opt1-q-${questionNumber}" class="col-form-label">1</label>
                        <input id="opt1-q-${questionNumber}" type="text" required class="form-control d-inline-block" name="question-${questionNumber}-opt">
                    </div>
                    <div class="d-flex  align-items-center">
                        <input type="radio" required value="1" class="checkBox" name="question-${questionNumber}-ans"
                        id="q-${questionNumber}-op1">
                        <label for="q-${questionNumber}-op1" class="m-0 ml-1">Correct Answer</label>
                    </div>
                </div>
                <div class="d-flex my-2">
                    <div class="options">
                        <label for="opt2-q-${questionNumber}" class="col-form-label">2</label>
                        <input id="opt2-q-${questionNumber}" type="text" required class="form-control d-inline-block"
                        name="question-${questionNumber}-opt">
                    </div>
                    <div class="d-flex  align-items-center">
                        <input type="radio" value="2" class="checkBox" name="question-${questionNumber}-ans"
                            id="q-${questionNumber}-op2">
                        <label for="q-${questionNumber}-op2" class="m-0 ml-1">Correct Answer</label>
                    </div>
                </div>
                <div class="d-flex">
                     <div class="options">
                         <label for="opt3-q-${questionNumber}" class="col-form-label">3</label>
                         <input id="opt3-q-${questionNumber}" type="text" required class="form-control d-inline-block"
                               name="question-${questionNumber}-opt">
                    </div>
                    <div class="d-flex  align-items-center">
                         <input type="radio" value="3" class="checkBox" name="question-${questionNumber}-ans"
                            id="q-${questionNumber}-op3">
                        <label for="q-${questionNumber}-op3" class="m-0 ml-1">Correct Answer</label>
                    </div>
                </div>
                <div class="d-flex my-2">
                    <div class="options">
                        <label for="opt4-q-${questionNumber}" class="col-form-label">4</label>
                        <input id="opt4-q-${questionNumber}" type="text" required class="form-control d-inline-block" 
                        name="question-${questionNumber}-opt">
                    </div>
                    <div class="d-flex  align-items-center">
                        <input type="radio" value="4" class="checkBox" name="question-${questionNumber}-ans"
                            id="q-${questionNumber}-op4">
                        <label for="q-${questionNumber}-op4" class="m-0 ml-1">Correct Answer</label>
                    </div>
                </div>


            </div>
        </div>
        `
        questionsParentDev.append(divElement)
        $(".cross").click(function (event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            if(!($($(this).parents()[2]).next()[0])){
                   $(this).parents()[2].remove()
            }else{
                alert("Remove the last question plz")
                return
            }
        })
    })
})