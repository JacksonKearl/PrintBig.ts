# PrintBig.ts

A poor man (aka Mac/Linux user)'s imitation of the inimitable Matthias Wandel's [BigPrint](https://woodgears.ca/bigprint/) program.

Available as a fully local cross-platform browser based utility at [https://printbig.pages.dev](https://printbig.pages.dev).

## purpose

It is often the case when building large scale projects that a full-size template of the work to be completed would be helpful to consult. For instance, one might glue the template to a stock workpiece and cut out the profile, or position surface features like drill holes. 

The goal of this program is to take as input an image template of a size too large to be printed on a single sheet of paper, and split it into many different page-sized images that can all be printed out independently and easily and accurately assembled together.

To this end, two grids are placed over the image: a vertical/horizontal grid that aids in rough positioning, and a diagonal grid that aids in fine adjustment of the positioning and angle of pages. By using these two grids together, many pages can be assembled together to form one cohesive template, with minimal loss in accuracy.

Furthermore, a degree of overlap between adjacent pages is configurable, which serves to make cutting the document margins away as painless as possible – by default, cuts may be up to a fifth of an inch off from the true edge without any loss of composite image data.

More information on uses for this project can be found on [the original version's page](https://woodgears.ca/bigprint/about.html).

### differences between this and BigPrint

The original BigPrint program has much more functionality than this project currently implements, but is only available on Windows. Specifically, BigPrint:

- Provides a UI for configuring the scale of an image
- Can modify the color of images to reduce ink use
- Allows for fine tuned dual axis printer error compensation
- Implements "Tape Measure" mode

If you are on Windows and those features sound interesting, try [BigPrint](https://woodgears.ca/bigprint/index.html)!

