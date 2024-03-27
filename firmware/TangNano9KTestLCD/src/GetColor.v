module GetColor (

    input [15:0]  PixelCount,
    input [15:0]  LineCount,

	output	[4:0]	LCD_R,
	output	[5:0]	LCD_G,
	output	[4:0]	LCD_B

);

    reg SQ1_PRESENT;
    Square #(100,400,200,400) SQUARE_1 (
        .PixelCount(PixelCount),
        .LineCount(LineCount),
        .SHAPE_PRESENT( SQ1_PRESENT)
    );

    reg SQ2_PRESENT;
    Square #(100,300,600,800) SQUARE_2 (
        .PixelCount(PixelCount),
        .LineCount(LineCount),
        .SHAPE_PRESENT( SQ2_PRESENT)
    );

    // Display green square
    assign LCD_R = 5'b00000;
    
    assign LCD_G = ( SQ1_PRESENT || SQ2_PRESENT ) ? 6'b111111 : 6'b000000; // Green

    assign LCD_B = 5'b00000;

endmodule