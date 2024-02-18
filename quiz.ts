#!/usr/bin/env node

import inquirer, { Answers, Question } from 'inquirer';
import showBanner from 'node-banner';
import { createSpinner } from 'nanospinner';
import { Spinner } from 'nanospinner';
import chalk from 'chalk';


let time = (time = 2000) => new Promise((r) => setTimeout(r, time));


async function myBanner() {
    showBanner('QUIZ', 'You can choose number of MCQs, Category and difficulty level')

}

async function getUserName(): Promise<string> {
    let { userName } = await inquirer.prompt(
        {
            name: "userName",
            type: "input",
            default: "Hamza",
            message: "Enter Your Name :"
        }
    )

    return userName
}

async function userCategory(): Promise<string> {
    let categories = [
        { name: "General Knowledge", value: 9 },
        { name: "History", value: 23 },
        { name: "Entertainment: Books", value: 10 },
        { name: "Entertainment: Music", value: 12 },
        { name: "Entertainment: Video Games", value: 15 },
        { name: "Entertainment: Science & Nature", value: 17 },
        { name: "Computers", value: 18 },
        { name: "Mathematics", value: 19 },
        { name: "Sports", value: 21 },
        { name: "Animals", value: 27 }
    ];


    let { category } = await inquirer.prompt([
        {
            name: "category",
            type: "rawlist",
            message: "Select Your Category :",
            choices: categories


        }
    ])
    return category

}

async function userDifficulty(): Promise<number> {
    let { difficulty } = await inquirer.prompt({
        name: 'difficulty',
        type: 'rawlist',
        choices: ["Easy", "Medium", "Hard"],
        message: "Select Difficulty :",
    })
    return difficulty.toLowerCase()
}

async function numberOfQuestions(): Promise<number> {
    let { noOfQuestions } = await inquirer.prompt([
        {
            name: "noOfQuestions",
            type: "number",
            message: "Enter Number of Questios (Max 50) : ",
            validate: (input) => {
                if (isNaN(input)) {
                    console.log(`${chalk.red(`\n>>>`)} Please Enter a number.`);

                } else if (input < 0 || input > 50) {
                    console.log(`${chalk.red(`\n>>>`)} Please Enter a number between 1 to 50.`);

                } else {
                    return true;
                }
            }
        }
    ])

    return noOfQuestions
}

async function dataFetching(category: string, difficulty: number, noOfQuestions: number): Promise<{ data: Question[], userCorrectOption: number }> {
    const spinner = createSpinner('Loading MCQs...').start()
    await time(1000);
    spinner.success({ text: 'MCQs Loaded Successfully' });


    let data = await fetch(`https://opentdb.com/api.php?amount=${noOfQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`)
        .then((data) => (data.json()))
        .then((data) => (data['results']))
        .catch((error) => console.log(`Error During fetching data : \n ${error}`));

    let userCorrectOption: number = 0
    for (let i = 0; i < noOfQuestions; i++) {
        let userCorrectAnser = data[i].correct_answer
        let incorrectAnswer = data[i].incorrect_answers

        console.log(chalk.bgRed.whiteBright(`\n Question${i + 1}/${noOfQuestions} `));

        let displayQuestion = data[i].question
        console.log(displayQuestion);
        console.log(`\n`);
        

        let rendom = Math.floor(Math.random() * 3)

        incorrectAnswer.splice(rendom, 0, userCorrectAnser)

        let mcqs = await inquirer.prompt(
            {
                name: "mcqs",
                type: 'rawlist',
                message: "Choose the Correct Answer :",
                choices: incorrectAnswer
            }
        )
        let userAnswer = await mcqs['mcqs']
        console.log(userAnswer)



        if (userAnswer === userCorrectAnser) {
            userCorrectOption += 1
        }
    }

    return { data, userCorrectOption }

}
async function showResult(userCorrectOption: number, userName: string, noOfQuestions: number, category: string, difficulty: number) {
    const spinner = createSpinner('Compiling Result').start()
    await time()

    let percentage = Math.floor((userCorrectOption / noOfQuestions) * 100);
    let person = percentage >= 50 ? "Champion" : "Loser";
    spinner.success({ text: 'Result Compiled' });

    console.log(`\n`);
    console.log(chalk.bgRed.whiteBright(`                 Your Scorecard                `))
    console.log(`\t      Scorecard of a ${person}: `);
    console.log(chalk.whiteBright(`-----------------------------------------------`))
    console.log(chalk.rgb(255, 142, 133)(` Name : ${chalk.whiteBright(userName)}`))
    console.log(chalk.whiteBright(`-----------------------------------------------`))
    console.log(chalk.rgb(255, 142, 133)(` Category : ${chalk.whiteBright(category)}`));
    console.log(chalk.whiteBright(`-----------------------------------------------`))
    console.log(chalk.rgb(255, 142, 133)(` Difficulty : ${chalk.whiteBright(difficulty)}`))
    console.log(chalk.whiteBright(`-----------------------------------------------`))
    console.log(chalk.rgb(255, 142, 133)(` Total MCQs : ${chalk.whiteBright(noOfQuestions)}`))
    console.log(chalk.whiteBright(`-----------------------------------------------`))
    console.log(chalk.rgb(255, 142, 133)(` Correct Answers : ${chalk.whiteBright(userCorrectOption + " out of " + noOfQuestions)}`))
    console.log(chalk.whiteBright(`-----------------------------------------------`))
    console.log(chalk.rgb(255, 142, 133)(` Percentage : ${chalk.whiteBright(percentage + "% out of 100%")}`))
    console.log(chalk.whiteBright(`-----------------------------------------------`))


}


async function reattemptQuiz(): Promise<boolean> {
    let { again } = await inquirer.prompt([{
        name: "again",
        type: "confirm",
        message: "Do you want to attempt quiz again? "
    }]);

    return again;
}


async function callFuntion() {


    await myBanner();
    await time(1000);

    while (true) {
        let userName = await getUserName();

        let category = await userCategory();

        let difficulty = await userDifficulty();

        let noOfQuestions: number = await numberOfQuestions();

        let { data, userCorrectOption } = await dataFetching(category, difficulty, noOfQuestions);

        let showresult = showResult(userCorrectOption, userName, noOfQuestions, category, difficulty)
        let eixt = await reattemptQuiz();

        if (!eixt) {
            break;
        }
    }
    console.log(chalk.whiteBright.bold.greenBright(`\n_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_\n`))
    
}


await callFuntion()