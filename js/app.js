/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var YAML = require('yamljs');
var marked = require('../bower_components/marked/index.js');

var Message = function(id, datetime, sender, subject, body) {
    this.id = id;
    this.datetime = datetime;
    this.sender = sender;
    this.subject = subject;
    this.body = body;
}

var MessageListRow = React.createClass({
    render: function() {
        var classname = 'large-12 columns' + (this.props.selected ? ' selected' : '');
        return <div className={ classname }>
            <div className="row">
            <div className="large-1 medium-1 columns">{ this.props.rowIndex }</div>
            <div className="large-1 medium-1 columns">{
                moment(this.props.message.datetime).format('MMM DD YYYY')
            }</div>
            <div className="large-3 medium-3 columns">{ this.props.message.sender }</div>
            <div className="large-1 medium-1 columns">123</div>
            <div className="large-6 medium-6 columns">{ this.props.message.subject }</div>
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
    render: function() {
        var displayRange = {
            start: Math.max(Math.min(this.props.selectedIndex - (this.props.windowSize / 2),
                                     this.props.messages.length - this.props.windowSize),
                            0),
            end: Math.min(Math.max(this.props.selectedIndex + (this.props.windowSize / 2),
                                   this.props.windowSize),
                          this.props.messages.length)
        };
        var msgs = this.props.messages.slice(displayRange.start,
                                             displayRange.end);
        return <nav className="large-12 columns">
            {
                _.map(msgs, function(message, idx) {
                    return <MessageListRow message={ message }
                    rowIndex={ displayRange.start + idx }
                    key={ message.id }
                    selected={ displayRange.start + idx == this.props.selectedIndex }/>;
                }, this)
            }
        </nav>;
    }
});

var MessageView = React.createClass({
    render: function() {
        return <div class="large-12 columns panel">
            <dl>
            <dt>Date:</dt>
            <dd>{ moment(this.props.message.datetime).format() }</dd>
            <dt>Sender:</dt>
            <dd>{ this.props.message.sender }</dd>
            <dt>Subject:</dt>
            <dd>{ this.props.message.subject }</dd>
            </dl>
            <div dangerouslySetInnerHTML={{__html: marked(this.props.message.body) }}></div>
            </div>;
    }
});

var MuttApp = React.createClass({
    getInitialState: function() {
        return {
            selectedMessageIndex: 0
        };
    },
    selectNext: function() {
        if (this.state.selectedMessageIndex < this.props.messages.length - 1) {
            this.setState({
                selectedMessageIndex: this.state.selectedMessageIndex + 1
            });
        }
    },
    selectPrevious: function() {
        if (this.state.selectedMessageIndex > 0) {
            this.setState({
                selectedMessageIndex: this.state.selectedMessageIndex - 1
            });
        }
    },
    render: function() {
        return <div>
            <header className="row">
            <div className="large-12 columns">
            <div className="row">
            <div className="large-12 columns">q:Quit  d:Del  u:Undel  s:Save  m:Mail  r:Reply  g:Group  ?:Help</div>
            </div>
            <div className="row">
            <MessageList messages={ this.props.messages } selectedIndex={ this.state.selectedMessageIndex } />
            </div>
            <div className="row">
            <div className="large-12 columns" id="statusline-top">-*-Mutt:</div>
            </div>
            </div>
            </header>

            <div className="row">
            <MessageView message={ this.props.messages[this.state.selectedMessageIndex] } />
            </div>

            <footer className="row">
            <div className="large-12 columns">
            <div className="row" id="statusline-bottom">-   - 123 / 245</div>
            </div>
            </footer>
            </div>;
    }
});

// read messages and render app
Promise.cast($.get('/content/blog/articles.json')).then(function(data) {
    return Promise.map(data, function(name, idx) {
        return Promise.cast($.get('/content/blog/' + name)).then(function(data) {
            var parts = data.match(/^---\n((?:.+:.+\n)+)---\n((?:.|\n)*)$/m);
            console.log(parts[1]);
            var header = YAML.parse(parts[1]);
            var body = parts[2];
            return new Message(idx,
                               header.created_at,
                               'Ilkka Laukkanen <ilkka@fastmail.fm>',
                               header.title,
                               body);
        });
    });
}).then(function(messages) {
    return messages.reverse();
}).then(function(messages) {
    var app = React.renderComponent(<MuttApp messages={ messages }/>,
                                    document.getElementById('app'));

    // bind keyboard shortcuts
    $(document).bind('keydown.nav', 'j', function() {
        app.selectNext();
    });

    $(document).bind('keydown.nav', 'k', function() {
        app.selectPrevious();
    });
});
