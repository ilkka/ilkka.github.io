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

var messages = _.map(_.range(100), function(idx) {
    return new Message(idx,
                       new Date(),
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
            selectedIndex: 20
        };
    },
    render: function() {
        var displayRange = {
            start: this.state.selectedIndex - 5,
            end: this.state.selectedIndex + 5
        };
        var msgs = this.props.messages.slice(displayRange.start,
                                             displayRange.end);
        return <div>
            {_.map(msgs, function(message, idx) {
                return <MessageListRow
                datetime={ moment(message.datetime).format('MMM DD YYYY') }
                sender={ message.sender }
                subject={ message.subject }
                key={ message.id }/>;
            })}
        </div>;
    },
    selectNext: function() {
        if (this.state.selectedIndex < this.props.messages.length - 1) {
            this.setState({
                selectedIndex: this.state.selectedIndex + 1
            });
            console.log('inc to ' + this.state.selectedIndex);
        } else {
            console.log('no inc');
        }
        this.setProps();
    },
    selectPrevious: function() {
        if (this.state.selectedIndex > 0) {
            this.setState({
                selectedIndex: this.state.selectedIndex - 1
            });
            console.log('dec to ' + this.state.selectedIndex);
        } else {
            console.log('no dec');
        }
    }
});

var messagelist = React.renderComponent(<MessageList messages={ messages }/>, document.getElementById('nav'));

 $(document).bind('keydown.nav', 'j', function() {
    messagelist.selectNext();
});

$(document).bind('keydown.nav', 'k', function() {
    messagelist.selectPrevious();
});
