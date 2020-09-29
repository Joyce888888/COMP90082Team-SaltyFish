import React, { Component } from 'react'
import {Helmet} from "react-helmet";
import axios from 'axios';
import {connect} from 'react-redux';
import { Nav, Navbar, Dropdown, Card, CardGroup, Accordion, AccordionToggle} from 'react-bootstrap';
import styled from 'styled-components';
import logo from './logo.svg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { setCurrentUser, logoutUser } from "./../actions/authActions";
import JwtDecode from 'jwt-decode';
import setAuthToken from "../utils/setAuthToken"
import { GET_PROFILE } from "../actions/profileActions";
import Footer from "./Footer";
import NavigationBar from "./NavigationBar"


import image from './blank-profile.png';


class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      name: '',
      bio: '',
      skills: [],
      subjects: [],
      education: [],
      website: '',
      phone: '',
      selectedFile: null,
      profilePicture: ''
    };
  this.onLogoutClick=this.onLogoutClick.bind(this);}

    onLogoutClick = (e) => {
      e.preventDefault();
      this.props.logoutUser();
      this.props.history.push('/login');
  };
  componentDidMount() {
    axios
        .get('/profile1/'+(this.props.auth.user))

        .then(res=>{
          this.setState({email:res.data[0].email,
                         name:res.data[0].name,
                         bio:res.data[0].bio,
                         skills:res.data[0].skills,
                         subjects:res.data[0].subjects,
                         education:res.data[0].education,
                         website:res.data[0].website,
                         phone:res.data[0].phone,
                         profilePicture: res.data[0].profile_picture,
                         imgHash: Date.now()
                        });
          console.log(this.state);
          console.log("2");})

    
}

  fileSelectedHandler = event => {
    this.setState({
      selectedFile: event.target.files[0]
    })
  }



  fileUploadHandler = () => {
    const fd = new FormData();
    if (this.state.selectedFile == null) {
      return (Error);
    }
    fd.append('image', this.state.selectedFile);
      try {
        axios.post('/img-upload', fd).then((postResponse) => {
        this.newPP = postResponse.data.imageUrl;
        console.log(postResponse);
      }, (err) => {
        console.log(err);
      }).then(() => {
        //do PUT call
        const data = {
          profilePic: this.newPP
        }
        console.log(data);
        axios.put('/addprofilepic/' + this.props.auth.user, data).then((putResponse) => {
          //do PUT stuff with response
          this.setState({
            profilePicture: this.newPP
          });
          console.log(putResponse);
        })
      })
    }catch(err) {
      console.log(err);
    };
  }

  
  render() {
    
    //if ((this.state.email.length)===0)
    //{ console.log("1");
      //this.componentDidMount();
      //return null;
    //}
    
    
    return (
      <div className = "page-container">
        <NavigationBar/>
        <div className="jumbotron mt-5">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center">WELCOME {this.state.email} </h1>
            <h2 className = "text-center">Welcome {this.state.bio} </h2>
          </div>
        </div>
        <div class = "row">
            <div class="col-md-3"></div>
                <CardGroup>
                    <Card style={{ width: '30rem' }}>
                        <Card.Header> Jonh Doe </Card.Header>
                        <Card.Body>
                            <Card.Text> Bio goes here</Card.Text>
                        </Card.Body>
                    </Card>
                    <Card style={{ width: '30rem' }}>
                        <Card.Img src={image} alt= "Card image"/>
                    </Card>
                </CardGroup>
          </div>
          <div class = "row">
            <div class="col-md-3"></div>
            <CardGroup>
                    <Card style={{ width: '20rem' }}>
                      <Card.Header> Accademics </Card.Header>
                    </Card>
                    <Card style={{ width: '20rem' }}>
                      <Card.Header> Skills </Card.Header>
                    </Card>
                    <Card style={{ width: '20rem' }}>
                      <Card.Header> Projects </Card.Header>
                    </Card>
                </CardGroup>
          </div>
          {/*1: this is apparently how you comment seems overly complicated
          2: i am unsure as to how to properly format the cards and what not to look good. Dylan*/}
          <div class = "row">
            <div class="col-md-3"></div>
              <Accordion>
                <Card style={{ width: '60rem' }}>
                  <Accordion.Toggle as = {Card.Header} eventKey = '0'>
                    Accademics
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>this should be a list of Accademic pages</Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
          </div>
          <div class = "row">
            <div class="col-md-3"></div>
              <Accordion>
                <Card style={{ width: '60rem' }}>
                  <Accordion.Toggle as = {Card.Header} eventKey = '0'>
                    Skills
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>this should be a list of Skill pages</Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
          </div>
          <div class = "row">
            <div class="col-md-3"></div>
              <Accordion>
                <Card style={{ width: '60rem' }}>
                  <Accordion.Toggle as = {Card.Header} eventKey = '0'>
                    Projects
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>this should be a list of Project pages</Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
          </div>
        <Footer/>
      </div>
    )
  }
}
Profile.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
  });
export default connect(mapStateToProps, {logoutUser})(Profile);