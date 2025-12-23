# p5ss

p5ss is a CLI tool for capturing screenshots of p5.js execution results.

## Installation

```sh
$ npm install p5ss
```

## Usage

```sh
$ p5ss -h
Usage: p5ss [options]

p5.js screenshot tool

Options:
  -V, --version          output the version number
  -i, --input <file>     Input p5.js sketch file
  -o, --output <file>    Output screenshot file (default: "screenshot.png")
  -f, --frames <number>  Number of frames to render before taking screenshot (default: "1")
  -h, --help             display help for command
```

## Example

sketch.js:

```javascript
let angle = 0;

function setup() {
  createCanvas(800, 600);
  rectMode(CENTER);
  angleMode(DEGREES);
}

function draw() {
  background(128);

  translate(width / 2, height / 2);

  for (let i = 0; i < 5; i++) {
    push();
    rotate(angle + i * 36);

    const size = 200 - i * 30;
    const hue = (angle + i * 36) % 360;

    fill(hue, 255, 200, 150);
    stroke(255);
    strokeWeight(2);

    rect(0, 0, size, size);
    pop();
  }

  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(20);
  text('Frame: ' + frameCount, 0, 250);

  angle += 2;
}
```

command:

```sh
$ p5ss -i sketch.js -f 30
Screenshot saved to: /home/user/screenshot.png
Canvas size: 800x600px
Frames rendered: 30
```

screenshot.png:

![screenshot.png](https://github.com/user-attachments/assets/4a423cdc-d709-4e63-97e4-5b52a4b1e8f4)

## License

The program is available as open source under the terms of the [MIT License](https://github.com/yoshoku/p5ss/blob/main/LICENSE.txt)
