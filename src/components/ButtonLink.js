import React from 'react'
import {Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'

export default class ButtonLink extends Button {
  render () {
    // render the Button component with our initial set of props,
    // and expose the rendered props
    const el = new Button(this.props).render()
    const {props} = el
    // pass the props to Link
    return <Link {...el.props} />
  }
}
