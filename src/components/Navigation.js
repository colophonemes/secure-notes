import React from 'react';
import { Route, Link, NavLink } from "react-router-dom"
import { Navbar, Nav } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {Home, Editor, Dropbox} from 'containers'
// Router
const Routes = () => (
  <div>
    <Route exact path='/' component={Home} />
    <Route path='/select-file' component={Dropbox.SelectFile} />
    <Route path='/editor' component={Editor} />
    <Route path='/dropbox/authenticate' component={Dropbox.Authenticate} />
  </div>
)

// Navigation
const Navigation = () => (
  <Navbar fixedTop>
    <Navbar.Header>
      <Navbar.Brand>
        <Link to="/"><FontAwesome name='lock' /> Secure Notes</Link>
      </Navbar.Brand>
    </Navbar.Header>
    <Nav>
      <LinkNavItem to="/select-file">
        Open Note <FontAwesome name='dropbox' />
      </LinkNavItem>
    </Nav>
  </Navbar>
)

const LinkNavItem = ({to, children}) => <li role='presentation'>
  <NavLink to={to} activeClassName='active'>{children}</NavLink>
</li>

export {Navigation, Routes}
