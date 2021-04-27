import React from 'react';
import { Col } from 'react-bootstrap';
import Logo from '../../visuals/Logo.png'
import Footer from './Footer';
import Style from './info-pages.module.css';
import classes from "./footer.module.css";


function Loading(){

    return (

            <Col className="d-flex justify-content-center">
                <img src={Logo} className={Style.rmSpinner} width={100} height={100} alt="Loading..."/>
            </Col>

    )

};

export default Loading;