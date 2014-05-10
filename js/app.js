/** @jsx React.DOM */
var React = require('react');

var MyComponent = React.createClass({
    render: function() {
        return <div className="large-12 columns">
              <div className="panel">
                <p>moroo</p>
              </div>
            </div>;
    }
});

React.renderComponent(<MyComponent/>, document.getElementById('thingy'));
