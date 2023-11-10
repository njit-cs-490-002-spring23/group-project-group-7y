# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/), and is designed to be reused across semesters.
You can view our reference deployment of the app at [app.covey.town](https://app.covey.town/), and our project showcase ([Fall 2022](https://neu-se.github.io/CS4530-Fall-2022/assignments/project-showcase), [Spring 2022](https://neu-se.github.io/CS4530-Spring-2022/assignments/project-showcase), [Spring 2021](https://neu-se.github.io/CS4530-CS5500-Spring-2021/project-showcase)) highlight select student projects.

![Covey.Town Architecture](docs/covey-town-architecture.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react). Twilio's React Starter App is packaged and reused under the Apache License, 2.0.

A backend service (in the `townService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `townService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `townService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `townService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `NEXT_PUBLIC_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the towns service to another location, put that location here instead)

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.

## Sprint 0

### Task 1
[Chess Research](https://docs.google.com/document/d/1ltdmtVU1qt_3xL7zMYdBfDGNctp5DIB7kuPOp2u8hF0/edit?usp=share_link)

### Task 2
[Research and document common chess UI’s for ideas](https://docs.google.com/document/d/1sRrt-LXmMD0XZuwsx1H9pcTn259IzrWjv2b6xTpSQWk/edit?usp=share_link)

### Task 3
[Chess Implementation](https://docs.google.com/document/d/1QeHZiVdBC0Sml9_cBELD4x3lXeFCeFw6HailgKoM_i8/edit?usp=share_link)

### Task 4
[Research and document common game review features and actions for chess ](https://docs.google.com/document/d/1DC-Zvpw6DinjGFsLewzPPfa1pLaYa0V2NhS9mOU2oaI/edit?usp=share_link)

### Task 5
[Research third-party chess APIs that allow to obtain the next best move ](https://docs.google.com/document/d/1XoSNqdx_ildbTRr0SJjol3wtLF7AhcIjw-_rWmYIDRQ/edit?usp=share_link)

### Task 6
[3rd Party API for User Interface - Documentation](https://docs.google.com/document/d/14h7mEIp4um5r5NJPfUguPTzycIIcw614JpGbsvwFkw8/edit?usp=share_link)

### Task 7
[Design interfaces and data types for frontend and create documentation for interfaces](https://docs.google.com/document/d/1TooDaz6ug2rfLgawBFNe0XpcEqPa4QvlFDVyUWbLrJw/edit?usp=share_link)

## Sprint 1

### Task 1
[Database Research and Management with Typescript](https://docs.google.com/document/d/1bqMUMFa7O4HjRHJGxy82FTstx-rrYhfpN3GVkhX_LXs/edit?usp=sharing)

### Task 2
[Design of the gameboard and chess pieces](https://docs.google.com/presentation/d/1jmmCHMWRPT9zuWl78vUmkmx3GFAD6Zj-/edit?usp=sharing&ouid=100718077119225492816&rtpof=true&sd=true)

### Task 3
[Designing the user interace for the gameboard](https://docs.google.com/document/d/1pREZEXUDe0_FscI3BMJkE5hS-1aM2Qsn4YKFWjh4zmM/edit?usp=sharing)

### Task 4
[Design chess leaderboard](https://docs.google.com/document/d/1PwIqL4AvGcFCycayBFnHccCfSCnx0Ok4/edit?usp=sharing&ouid=100718077119225492816&rtpof=true&sd=true)

### Task 5
[Design interfaces and data types for backend](townService/src/types/CoveyTownSocket.d.ts)

### Task 6
[Research and Documentation for Chess GUI Implementation](https://docs.google.com/document/d/11To7b_DTHehHaiW3Tg7cwgZXYCvJHyCM3t3HjxkCOR8/edit?usp=sharing)

