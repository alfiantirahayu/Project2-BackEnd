import React, { Component } from 'react';
import axios from 'axios';

class Register extends Component 
{

    register(obj) 
    {
      axios.post('http://localhost:3001/register', 
      { 
        name: obj.name.value, 
        username: obj.username.value, 
        password: obj.password.value,
        email: obj.email.value
      })
      .then(function(response){
        console.log('saved successfully')
      });
    }

    render()
    {
      return (
<div>
            Username : <input type="text" ref="username" placeholder="Username"/><br/>
            Password : <input type="password" ref="password" placeholder="Password"/><br/>
            Name : <input type="text" ref="name" placeholder="Name"/><br/>
            Email : <input type="text" ref="email" placeholder="Email"/><br/>
            <input type="submit" onClick={() => this.register(this.refs)} value="Submit"/>

</div>
      );
    }
}

export default Register;