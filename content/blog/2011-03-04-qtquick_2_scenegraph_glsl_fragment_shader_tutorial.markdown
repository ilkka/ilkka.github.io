---
kind: article
title: Qt Quick 2 QML Scene Graph GLSL fragment shader tutorial
created_at: 2011-03-04T13:33:50+02:00
tags: [ubuntu, maemo, n900, qml, qtquick, glsl, scenegraph, opengl]
excerpt: I had been hearing a lot about Scene Graph and Qt Quick 2 making it possible to implement whatever effects one wanted, to really make apps gorgeous, and still stay in the la-la-land of QML UI coding. What I *hadn't* had was a chance to try it out myself, until recently that is. It's been the most fun I remember having in a while, coding-wise.
---

I had been hearing a lot about Scene Graph and Qt Quick 2 making it possible to
implement whatever effects one wanted, to really make apps gorgeous, and still
stay in the la-la-land of QML UI coding. What I *hadn't* had was a chance to
try it out myself, until recently that is. It's been the most fun I remember
having in a while, coding-wise.

As usual though, documentation is a bit lacking. The effects are implemented
using OpenGL Shader Language (GLSL), and googling does reveal some tutorials for
that, but still the jump from those mainly C/C++ OpenGL -oriented write-ups to
Qt Quick 2 isn't altogether straightforward. The docs that I found most helpful
were:

  * [Zchydem's earlier blog
    post](http://zchydem.enume.net/2010/11/01/playing-with-qt-scene-graph/)
  * [The GLSL reference manual](http://www.opengl.org/documentation/glsl/)
  * [Lighthouse 3D's GLSL tutorial](http://www.lighthouse3d.com/opengl/glsl/)

So, having studied these and banged my head against the wall, I was pretty
excited when I got my first fragment shaders working on both Ubuntu and the
N900. I then decided that I'd do a tutorial-style write-up to maybe make it
easier for other people to get started. This is not a real GLSL tutorial
because I'm really not qualified to write something like that. I'm aiming to
tell you what I know, and give tips on how to apply other GLSL tutorials to a
Qt Quick context. Here's a short-n-shaky video of what I managed and what this
tutorial will produce:

<iframe src="http://player.vimeo.com/video/20641884" width="400" height="300">
</iframe><p><a href="http://vimeo.com/20641884">Qt Quick 2
Scenegraph + GLSL fragment shaders</a> from <a
href="http://vimeo.com/user4754672">Ilkka Laukkanen</a> on <a
href="http://vimeo.com">Vimeo</a>.</p>

## Building Qt with Scene Graph ##

To get all the scene graph goodness working, you need to build a special
version of Qt. There are two ways to accomplish this that I know of:

  1. Qt master + scene graph master (as documented in [Zchydem's
     post](http://zchydem.enume.net/2010/11/01/playing-with-qt-scene-graph/))
  2. The `qml-team/qtquick2` branch from the [Qt staging
     repo](http://gitorious.org/qt/staging).

I'd actually recommend the second method because it's a simpler,
almost-one-step process, and because it's the method I *know* will work for
the N900. So go ahead and clone, checkout and build:

<pre><code>$ git clone git://gitorious.org/qt/staging.git
$ cd staging
$ git checkout -b qtquick2 origin/qml-team/qtquick2
$ ./configure -developer-build -opensource -confirm-license -fast \
     -nomake demos -nomake examples \
     && nice make -j5
</code></pre>

I guess you don't need `-developer-build` if going this route, but using it is
a habit I've gotten into, because you never know when you might need to build
something that uses those private headers. Also, you might want to scale the
number of `make` jobs according to your hardware.

When that completes, you will find the `qmlscene` binary in `staging/bin`.
It's a viewer for Scene Graph QML files, pretty much comparable to
`qmlviewer`.

## Running Qt Quick 2 files ##

I ran into a strange problem on my Ubuntu machine, where having the `LANG`
environment variable set would cause the shaders not to work correctly. I
therefore suggest you run everything in a sanitized environment (here `QTDIR`
is the `staging` directory from the build instructions above):

<pre><code>$ env -i LD_LIBRARY_PATH=$QTDIR/lib DISPLAY=:0 $QTDIR/bin/qmlscene \
    whatever.qml
</code></pre>

## First steps in Qt Quick 2 ##

For writing the actual code, I built the master branch of Qt Creator. It does
have syntax highlighting for GLSL, but apparently that only works when putting
the shaders in separate files, and that's not supported for plain QML UI
projects. I didn't get any further into that yet, but will surely explore
further later. For now, I just put the shaders inline into my QML. But I'm
getting ahead of myself.

Writing Qt Quick 2 code is pretty much exactly as writing Qt Quick 1 code,
unsurprisingly. Of course we `import QtQuick 2.0` in the beginning instead of
`QtQuick 1.x`, but other than that everything looks the same. Let's go ahead
and create a new "Qt Quick UI" project. What we get is this:

<pre><code>import Qt Quick 1.0

Rectangle {
    width: 360
    height: 360
    Text {
        anchors.centerIn: parent
        text: "Hello World"
    }
    MouseArea {
        anchors.fill: parent
        onClicked: {
            Qt.quit();
        }
    }
}
</code></pre>

Change the import to version 2.0, run it using `qmlscene` and it should work
as expected. Now the fun parts begin.

Remove the `Text` element, get a nice fun square-ish PNG image from somewhere,
and add `Image`, `Item` and `Text` elements like this:

<pre><code>import QtQuick 2.0

Rectangle {
    width: 512
    height: 512

    MouseArea {
        anchors.fill: parent
        onClicked: {
            Qt.quit();
        }
    }

    Image {
        id: kitty
        source: "kitty.png"
    }

    Item {
        id: scrollercontainer
        anchors.fill: parent

        Text {
            id: scroller
            text: "Hello QtQuick world!"
            color: "white"
            font.pixelSize: 80
            anchors.verticalCenter: parent.verticalCenter
        }
    }
}
</code></pre>

Still pretty basic stuff: we've got our `Image` and `Item` as children of the
main `Rectangle`. The reason why the `Text` is inside the `Item` rather than
as a direct child of the root is that we're going to use the use the `Item` to
clip the possibly long text to a manageable size, because a long text possibly
wouldn't fit into a texture.

One interesting thing here is that the Z-ordering or placement of the items
doesn't really have much bearing on how the end result is going to look, apart
from the size determining the effective size of the textures we're going to
animate in the end. So, bigger items &rarr; more detailed textures.

## Sourcery ##

Next, let's add `ShaderEffectSource` items for both the image and the text.
Note that we use the `scrollercontainer` element as the source for the
scroller shader, not the actual text element. This is the clipping bit.

<pre><code>    ShaderEffectSource {
        id: kitty_source
        sourceItem: kitty
    }

    ShaderEffectSource {
        id: scroller_source
        sourceItem: scrollercontainer
    }
</code></pre>

As far as I can tell, a `ShaderEffectSource` is an invisible item that acts as
a binding between a shader effect (that is, a `ShaderEffectItem`) and the
source element. Pretty much like a normal Qt Quick `Binding` element.

## The first effect ##

Okay, sources are set up so now let's set up the first effect. For that we're
going to create a `ShaderEffectItem`. It is a visible item and it will be
actual visual representation of the original, now-invisible image. We're going
to make this the background trippy kitty from the video at the top, so we're
going to set it to fill the parent. The real work is being done by the GLSL
code, i.e. the contents of the `fragmentShader` property:

<pre><code>    ShaderEffectItem {
        id: kitty_effect
        anchors.fill: parent

        property variant source : kitty_source

        fragmentShader: "
        varying highp vec2 qt_TexCoord0;
        uniform lowp sampler2D source;
        void main() {
            gl_FragColor = texture2D(source, qt_TexCoord0);
        }"
    }
</code></pre>

The shader above is a simple pass-through operation, in that it displays the
source image unaltered. A bit like a C program, the actual work is done in the
`main()` function. What the shader effectively does is set the color of a
"fragment" (i.e. pixel, I guess), and it performs this feat by giving a value
to the `gl_FragColor` variable. `gl_FragColor` is a four-component vector in
RGBA format, with all the components ranging from 0 to 1.

To display the original image, the filter needs to get the corresponding pixel
value from the source image. It does this by using the `texture2D()` function.
The function takes two parameters: the texture and a two-component vector,
again with both components between 0 and 1, signifying the `(x, y)` point in
the texture where to get the value from.

Before the `main()` function is a couple of declarations. The declarations in
GLSL have four parts: the first keyword is a storage qualifier, the second is
a precision qualifier, the third is the data type and fourth is the name.
Here I have to admit that the storage qualifiers are pretty much a mystery to
me: as far as I understand, `varying` is for communication between vertex and
fragment shaders, and `uniform` is for values that stay the same over a
primitive. The qualifiers here are basically just copied from other examples
and tutorials, but these seem to work. The precision qualifiers are only for
OpenGL ES, but I couldn't find any information on them in the GLES 2.x
specification. What I *did* notice is that the runtime I built for N900
requires them for everything, or the shaders don't work. I guess they might
have some performance impact but haven't explored it.

Both of the declarations act as an input to the shader. `qt_TexCoord0` is
apparently provided by the scene graph runtime, and is, unsurprisingly, the
input texture coordinate. `source` is for getting pixels from the source item.
This works by way of having a property by the same name in the
`ShaderEffectItem`. That property has type `variant` and gets the correct
`ShaderEffectSource` as its default value. This is how QML communicates with
the shader.

All right, that works but isn't interesting. But since we're setting all
components of the output color, we can do whatever we want to the original
pixels or even replace them. So let's do something more: 

## Some motion ##

<pre><code>    ShaderEffectItem {
        id: kitty_effect
        anchors.fill: parent

        property real angle : 0.0
        PropertyAnimation on angle {
            to: 360.0
            duration: 800
            loops: Animation.Infinite
        }

        property variant source : kitty_source

        fragmentShader: "
        varying highp vec2 qt_TexCoord0;
        uniform lowp sampler2D source;
        uniform highp float angle;
        void main() {
            highp float texAngle = 0.0;
            if (qt_TexCoord0.x != 0.0 || qt_TexCoord0.y != 0.0) {
                texAngle = atan(qt_TexCoord0.y - 0.5, qt_TexCoord0.x - 0.5);
            }
            gl_FragColor = vec4(sin(texAngle + radians(angle)),
                                sin(texAngle + radians(angle - 120.0)),
                                sin(texAngle + radians(angle - 240.0)),
                                1.0)
                           * texture2D(source, qt_TexCoord0);
        }"
    }
</code></pre>

We've added a few things here. The first is an animated `angle` property that
runs through a full circle in degrees and a corresponding `float` variable
declaration in the shader. We're using the angle to create a color spinner
that we're going to overlay on the source image.

To calculate the correct color to overlay on any given pixel, we note that it
depends on the angle of an imagined line drawn from the center of the image to
the pixel. This is simply a conversion from Cartesian to polar coordinates,
which is accomplished with an arc tan operation. Because the source texture
coordinates range from 0 to 1, however, the resultant angles will be from 0 to
90. To get angles that go all around, we shift the coordinates by -0.5.

Then we compose the value for `gl_FragColor` with a multiplication operation:
we multiply the original texture pixel with a four-component vector created
with the `vec4` function. Because we want the color components to change
gradually, we take their values from a sine function of the angle we
calculated earlier. We apply different offsets (120 and 240 degrees) to the
different components so that we get different colors at different directions,
and we also apply the animated offset from the QML `angle` property. Note that
`sin` takes a radian input, so we convert from degrees to radians. Finally,
while many 3D coding tutorials advocate a coding style where the decimal point
and zero are always written even when not necessary, in shaders it seems to be
required whenever dealing in floating-point numbers.

These enhancements result in a fun little primary color spinner overlaid on
the source image.

## Increase the trippy ##

I want more trippy. To increase the trippy, I want to twist up the spinner so
it's hypnotic!

<pre><code>    ShaderEffectItem {
        ...
        fragmentShader: "
        ...
        void main() {
            highp float texAngle = 0.0;
            if (qt_TexCoord0.x != 0.0 || qt_TexCoord0.y != 0.0) {
                texAngle = atan(qt_TexCoord0.y - 0.5, qt_TexCoord0.x - 0.5);
            }
            highp float skew = sqrt(pow(qt_TexCoord0.x - 0.5, 2.0)
                                    + pow(qt_TexCoord0.y - 0.5, 2.0))
                               * 10.0;
            highp vec4 colorwheel = vec4(sin(texAngle + radians(angle) - skew),
                                   sin(texAngle + radians(angle - 120.0) - skew),
                                   sin(texAngle + radians(angle - 240.0) - skew),
                                   1.0);
            highp vec4 texpixel = texture2D(source, qt_TexCoord0);
            gl_FragColor = colorwheel * texpixel;
        }"
    }
</code></pre>

Roight, the skew factor, or how far we twist up the spinner is relative to the
distance from the center of the spinner, so we calculate the value of `skew`
with Pythagoras' formula, with a suitable constant multiplier to get the
effect we want. We apply the skew as an offset to the sine function argument
in the `colorwheel` vector, and thus it acts as a delay that increases
linearly as the distance from the center of the item increases.

Finally for extra trippy let's make the background wavy! This is easy-peasy at
this point, all we need to do is throw the texture source coordinates through
sine and cosine functions before using `texture2D` to get the original image
pixel:

<pre><code>    ShaderEffectItem {
        ...
        fragmentShader: "
        ...
        void main() {
            ...
            highp float wavefactor = 0.03;
            highp float wave_x = qt_TexCoord0.x + wavefactor
                           * sin(radians(angle + qt_TexCoord0.x * 360.0));
            highp float wave_y = qt_TexCoord0.y + wavefactor
                           * cos(radians(angle + qt_TexCoord0.y * 360.0));
            highp vec4 texpixel = texture2D(source, vec2(wave_x, wave_y));
            gl_FragColor = colorwheel * texpixel;
        }"
    }
</code></pre>

## The scroller ##

That's pretty trippy. All it needs now is -- a scrolling message. That's how
I feel at least. So let's add some text to the `scroller` element and make it
scroll.

<pre><code>        Text {
            id: scroller
            text: "Hello QtQuick world! Hello QtQuick world! " +
		"Hello QtQuick world! Hello QtQuick world! " +
		"Hello QtQuick world! Hello QtQuick world! " +
		"Hello QtQuick world! Hello QtQuick world! "
            color: "white"
            font.pixelSize: 80
            anchors.verticalCenter: parent.verticalCenter
            PropertyAnimation on x {
                from: scrollercontainer.width
                to: -scroller.width
                duration: 800 * (scroller.width / 100)
                loops: Animation.Infinite
            }
        }
</code></pre>

Multi-line string literals are a bit clunky without support for here-doc
syntax, but this way we get a suitably long string to test the idea. A
bog-standard `PropertyAnimation` moves the text from right to left across the
parent element, with a speed that's dependent on the width of the string
itself, so that it stays constant with varying strings. Trippy and reminiscent
of old-school demo stuff, I like.

## All done for now ##

That's it for now. I'll try to find the time to keep working on this stuff a
bit more. The need to build the `qtquick2` staging branch is a bit of a
hindrance since it seems it's impossible to build it on OS X versions prior to
the upcoming Lion, due to a OpenGL version issue. Since my workhorse home
computer is a Mac, this puts a bit of a crimp on toying with scenegraph.

