import React from "react";

export default class Layout extends React.Component {

	constructor() {
    super();
  }

	render() {
		return (
			<div class="container">
				{this.props.children}
			</div>
		);
	}
}
