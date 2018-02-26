import React from 'react';
import { Route, Link, NavLink } from "react-router-dom"
import { Navbar, Nav } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {Home, Dropbox} from 'containers'

// Router
const Routes = () => (
  <div>
    <Route exact path='/' component={Home} />
    <Route path='/dropbox' component={Dropbox} />
  </div>
)

// Navigation
const Navigation = () => (
  <Navbar fixedTop>
    <Navbar.Header>
      <Navbar.Brand>
        <Link to="/">Secure Notes <FontAwesome name='lock' /></Link>
      </Navbar.Brand>
    </Navbar.Header>
    <Nav>
      <LinkNavItem to="/dropbox">
        Connect Dropbox <FontAwesome name='dropbox' />
      </LinkNavItem>
    </Nav>
  </Navbar>
)

const LinkNavItem = ({to, children}) => <li role='presentation'>
  <NavLink to={to} activeClassName='active'>{children}</NavLink>
</li>

export {Navigation, Routes}
