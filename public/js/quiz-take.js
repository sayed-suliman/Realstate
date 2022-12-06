$(document).ready(function () {
    let timeInSeconds = 0;
    let timeInterval;
    $('.retake').click(() => {
        timeInSeconds = 0;
        timeInterval = setInterval(timer, 1000)

        $('#quiz').removeClass('d-none')
        $('.timeHead').removeClass('d-none')
        $('#result').addClass('d-none')

        $('#quiz')[0].reset()
        $('.submit').attr('disabled', false)
        $('.submit').text('Submit')
        $('#quiz .feedback').addClass('d-none')
    })
    let seconds;
    let minutes;
    let time;

    timeInterval = setInterval(timer, 1000)
    var timer = () => {
        timeInSeconds++
        setQuizTimer()
    }
    var setQuizTimer = () => {
        seconds = timeInSeconds % 60
        minutes = Math.floor(timeInSeconds / 60)
        minutes = minutes < 10 ? `0${minutes}` : minutes
        seconds = seconds < 10 ? `0${seconds}` : seconds
        time = `${minutes}:${seconds}`
        $('.timer').text(time)
    }
    $('#quiz').submit(function (e) {
        clearInterval(timeInterval)
        e.preventDefault()
        const formData = $(this).serializeArray();
        console.log(time)
        // adding time at top of array 
        formData.unshift({ name: 'time', value: time })
        loading(true, 'Submitting you quiz.')
        $.ajax({
            url: '/test-quiz',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: ({ error, correctAns, wrongAns, point }) => {
                loading(false)
                if (!error) {

                    $('.submit').attr('disabled', true)
                    $('.submit').text('Submitted')

                    // $('#quiz').addClass('d-none')
                    $('.timeHead').addClass('d-none')
                    $('#result').removeClass('d-none')

                    // if point then show the result
                    // if (point) {
                    const percent = Math.floor((point / noOfQuestions) * 100)
                    const grade = percent >= 60 ? "passed" : "failed"

                    $('#result').removeClass('d-none')
                    $('#result .percent').text(`${percent}%`)
                    percent >= 60 ? $('#result .percent').removeClass('text-danger').addClass('text-success') : $('#result .percent').removeClass('text-success').addClass('text-danger')
                    $('#result .grade').text(`${grade}`)
                    grade == "failed" ? $('#result .grade').removeClass('text-success').addClass('text-danger') : $('#result .grade').removeClass('text-danger').addClass('text-success')
                    $('#result .points').text(`${point}/${noOfQuestions}`)
                    $('#result .time').text(time)
                    $('#result .correct').text(`${correctAns.length}`)
                    $('#result .wrong').text(`${wrongAns.length}`)
                    // }
                    if (wrongAns.length != 0) {
                        wrongAns.forEach(ans => {
                            var parent = $(`#quiz [name=${ans}]`).parents('.form-group-head')
                            parent.find('.feedback').removeClass('d-none').addClass('text-danger')
                            parent.find('.feedback').text("Your answer is wrong.")
                        })
                    }
                    if (correctAns.length != 0) {
                        correctAns.forEach(ans => {
                            var parent = $(`#quiz [name=${ans}]`).parents('.form-group-head')
                            parent.find('.feedback').removeClass('d-none').removeClass('text-danger').addClass('text-success')
                            parent.find('.feedback').text("Correct.")
                        })
                    }
                } else {
                    alert(error)
                }
            },
            error: (error) => {
                console.log(error)
            }
        })
    })
    var loading = (isLoading, msg = "Loading") => {
        var spinnerContainer = document.querySelector('.spinner')
        var quizContainer = document.querySelector('#quiz')
        var text = spinnerContainer.querySelector('.text');
        text.textContent = msg;
        if (isLoading) {
            spinnerContainer.classList.replace('d-none', 'd-flex')
            quizContainer.classList.add('opacity-25', 'event-none')
        } else {
            quizContainer.classList.remove('opacity-25', 'event-none')
            spinnerContainer.classList.replace('d-flex', 'd-none')
        }
    }
})