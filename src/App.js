import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-firebase';
import classnames from 'classnames';
import Fuse from 'fuse.js';
import logo from './logo.svg';
import './App.css';

firebase.initializeApp({
  apiKey: "XXXX",
  authDomain: "XXXX",
  databaseURL: "XXXX",
  projectId: "XXXX",
  storageBucket: "XXXX",
  messagingSenderId: "XXXX"
})

class App extends Component {

  constructor() {
    super();

    this.state = {
      fuse: undefined,
      searchText: '',
      attendees: [],
    };

    this.search = this.search.bind(this);
    this.showConfirm = this.showConfirm.bind(this);
    this.cancelConfirm = this.cancelConfirm.bind(this);
  }

  search({target: {value}}) {
    if (value && value.length) {
      const foundAttendees = this.state.fuse.search(value);
      console.log({foundAttendees});
      this.setState({
        attendees: foundAttendees,
        searchText: value,
      });
    } else {
      this.setState({
        searchText: '',
        attendees: this.state.allAttendees,
      });
    }
  }

  showConfirm(key) {
    const attendee = this.state.attendees.filter(attendee => attendee.key === key)[0];
    if (attendee.arrived) {
      return;
    }
    // Hack!
    attendee.showConfirm = true;
    this.forceUpdate();
  }

  cancelConfirm(key) {
    // Hack!
    this.state.attendees.filter(attendee => attendee.key === key)[0].showConfirm = false;
    this.forceUpdate();
  }

  componentWillReceiveProps({attendees = []}) {

    const attendeesCollection = Object.keys(attendees)
      .map(key => Object.assign({key}, attendees[key]));

    this.setState({
      fuse: new Fuse(attendeesCollection, {
        shouldSort: true,
        tokenize: true,
        distance: 3,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          'firstName',
          'lastName'
        ]
      }),
      attendees: attendeesCollection,
      allAttendees: attendeesCollection,
      searchText: '',
    });
  }

  render() {
    return (
      <div className="App">
        <h1>React Sydney</h1>
        <input type='text' onChange={this.search} placeholder='Enter name' value={this.state.searchText} />
        <ul>
          {Object.keys(this.state.attendees).map((key) => {
            const attendee = this.state.attendees[key];
            return (
              <li key={key}>
                <img className='avatar' src={attendee.avatar} />
                <div className='name'>{attendee.firstName} {attendee.lastName}</div>
                <a className={classnames('button', {'not-clicky': attendee.arrived})} onClick={this.showConfirm.bind(this, attendee.key)}>✅</a>
                {attendee.showConfirm ? (
                  <div className='confirmation'>
                    Confirm
                    <a className='button' onClick={this.props.arrived.bind(this, attendee.key)}>✅</a>
                    <a className='button' onClick={this.cancelConfirm.bind(this, attendee.key)}>❌</a>
                  </div>) : false
                }
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default connect((props, ref) => ({
  // This map is passed in as props to the component
  attendees: '/',
  arrived: attendeeId => ref(`/${attendeeId}`).update({
    arrived: true
  }),
}))(App);
