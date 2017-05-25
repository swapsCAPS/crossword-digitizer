import React, { Component } from 'react';

export class Button extends Component {
 constructor(props) {
    super(props)
  }

  render() {
		return (
			<div className={ `button ${this.props.buttonCSS}` } onClick={ this.props.onClick }>
				<i className="material-icons md-48">{ this.props.icon }</i>
			</div>
		)
  }

}
