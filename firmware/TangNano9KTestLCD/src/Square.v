module Square #(squareTop =100, squareBottom=400, squareLeft=100, squareRight=400)(

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