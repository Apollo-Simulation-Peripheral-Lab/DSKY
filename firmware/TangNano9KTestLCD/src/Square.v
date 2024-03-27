module Square #(squareTop, squareBottom, squareLeft, squareRight)(

    input [15:0]  PixelCount,
    input [15:0]  LineCount,

	output        SHAPE_PRESENT

);

    assign SHAPE_PRESENT = ( PixelCount >= squareLeft &&
        PixelCount <= squareRight &&
        LineCount >= squareTop &&
        LineCount <= squareBottom
    );

endmodule