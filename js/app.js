/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var moment = require('moment');

var Message = function(id, datetime, sender, subject, body) {
    this.id = id;
    this.datetime = datetime;
    this.sender = sender;
    this.subject = subject;
    this.body = body;
}

var messages = _.map(_.range(20), function(idx) {
    return new Message(idx,
                       new Date(),
                       "Ahto Simakuutio <ahto@simakuut.io>",
                       "Hello friend",
                       "foobar foobar");
});


var MessageListRow = React.createClass({
    render: function() {
        var classname = 'large-12 columns' + (this.props.selected ? ' selected' : '');
        return <div className={ classname }>
            <div className="row">
            <div className="large-1 columns">{ this.props.key }</div>
            <div className="large-1 columns">{
                moment(this.props.message.datetime).format('MMM DD YYYY')
            }</div>
            <div className="large-3 columns">{ this.props.message.sender }</div>
            <div className="large-1 columns">123</div>
            <div className="large-6 columns">{ this.props.message.subject }</div>
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
            selectedIndex: 10
        };
    },
    render: function() {
        var displayRange = {
            start: Math.max(Math.min(this.state.selectedIndex - (this.props.windowSize / 2),
                                     this.props.messages.length - this.props.windowSize),
                            0),
            end: Math.min(Math.max(this.state.selectedIndex + (this.props.windowSize / 2),
                                   this.props.windowSize),
                          this.props.messages.length)
        };
        var msgs = this.props.messages.slice(displayRange.start,
                                             displayRange.end);
        return <div>
            {
                _.map(msgs, function(message) {
                    return <MessageListRow message={ message }
                    key={ message.id }
                    selected={ message.id == this.state.selectedIndex }/>;
                }, this)
            }
        </div>;
    },
    selectNext: function() {
        if (this.state.selectedIndex < this.props.messages.length - 1) {
            this.setState({
                selectedIndex: this.state.selectedIndex + 1
            });
        }
    },
    selectPrevious: function() {
        if (this.state.selectedIndex > 0) {
            this.setState({
                selectedIndex: this.state.selectedIndex - 1
            });
        }
    }
});

// render message list
var messagelist = React.renderComponent(<MessageList messages={ messages }/>, document.getElementById('nav'));

// bind keyboard shortcuts
$(document).bind('keydown.nav', 'j', function() {
    messagelist.selectNext();
});

$(document).bind('keydown.nav', 'k', function() {
    messagelist.selectPrevious();
});
