import React, { Component } from 'react';
import axios from 'axios';


class App extends Component {
  
    register(obj) 
    {
      axios.post('http://localhost:3001/register', 
      { 
        name: obj.name.value, 
        email: obj.email.value,
        username: obj.username.value, 
        password: obj.password.value,
      })
      .then(function(response){
        console.log('saved successfully')
      });
    }
  render(){
    axios.get('http://localhost:3001/')
    .then((ambilData) =>
    {
      console.log(ambilData);
    })
        
      return (
        <div class="container bg-1">
        <center>
          <input type="text" ref="name" placeholder="Name"/><br/>
          <input type="email" ref="email" placeholder="email"/><br/>
          <input type="text" ref="username" placeholder="username"/><br/>
          <input type="password" ref="password" placeholder="password"/><br/>
          <input type="submit" onClick={() => this.register(this.refs)} value="Submit"/><br/>
        </center>
      </div>
    );
}
}


export default App;