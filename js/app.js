/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var moment = require('moment');

var Message = function(datetime, sender, subject, body) {
    this.datetime = datetime;
    this.sender = sender;
    this.subject = subject;
    this.body = body;
}

var messages = _.map(_.range(100), function() {
    return new Message(new Date(),
                       "Ahto Simakuutio <ahto@simakuut.io>",
                       "Hello friend",
                       "foobar foobar");
});


var MessageListRow = React.createClass({
    render: function() {
        return <div className="large-12 columns">
            <div className="row">
            <div className="large-1 columns">{ this.props.key }</div>
            <div className="large-1 columns">{ this.props.datetime.toString() }</div>
            <div className="large-3 columns">{ this.props.sender }</div>
            <div className="large-1 columns">123</div>
            <div className="large-6 columns">{ this.props.subject }</div>
            </div>
            </div>;
    }
});

var MessageList = React.createClass({
    getDefaultProps: function() {
        return {
            windowSize: 10
        };
    },
    getInitialState: function() {
        return {
            selectedIndex: 0
        }
    },
    render: function() {
        var displayRange = {
            start: Math.max(0, this.state.selectedIndex - (this.props.windowSize / 2)),
            end: Math.min(this.props.messages.length, this.state.selectedIndex + (this.props.windowSize / 2))
        };
        return <div>
            {_.map(this.props.messages.slice(displayRange.start, displayRange.end), function(message, idx) {
                return <MessageListRow datetime={ moment(message.datetime).format('MMM DD YYYY') } sender={ message.sender } subject={ message.subject } key={ idx }/>;
            })}
        </div>;
    }
});

React.renderComponent(<MessageList messages={ messages }/>, document.getElementById('nav'));
