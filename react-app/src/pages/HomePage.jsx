import React from 'react';
import {Link} from "react-router-dom";
import Lights from "../components/lights";
import Logs from "../components/logs";

const HomePage = () => {
    return (
        <div>
            <h1>Home page </h1>
            <Lights/>
            <Logs/>
        </div>
    );
};

export default HomePage;