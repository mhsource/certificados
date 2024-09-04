function parsePositionalData2(line) {
  const field1 = line.substring(0, 1).trim();   // %01d -> 1 dígito
  const field2 = line.substring(1, 4).trim();   // %03d -> 3 dígitos (2-4)
  const field3 = line.substring(4, 8).trim();   // %04d -> 4 dígitos (5-8)
  const field4 = line.substring(8, 15).trim();  // %07d -> 7 dígitos (9-15)
  const field5 = line.substring(15, 16).trim(); // %01d -> 1 dígito (16)
  const field6 = line.substring(16, 17).trim(); // %01d -> 1 dígito (17)
  const field7 = line.substring(17, 19).trim(); // %02d -> 2 dígitos (18-19)
  const field8 = line.substring(19, 22).trim(); // %03d -> 3 dígitos (20-22)
  const field9 = line.substring(22, 25).trim(); // %03d -> 3 dígitos (23-25)
  const field10 = line.substring(25, 40).trim(); // %015d -> 15 dígitos (26-40)
  const field11 = line.substring(40, 43).trim(); // %03d -> 3 dígitos (41-43)
  const field12 = line.substring(43, 47).trim(); // %04d -> 4 dígitos (44-47)
  const field13 = line.substring(47, 54).trim(); // %07d -> 7 dígitos (48-54)
  const field14 = line.substring(54, 55).trim(); // %01d -> 1 dígito (55)
  const field15 = line.substring(55, 103).trim(); // %48s -> 48 caracteres (56-103)

  return {
    field1,
    field2,
    field3,
    field4,
    field5,
    field6,
    field7,
    field8,
    field9,
    field10,
    field11,
    field12,
    field13,
    field14,
    field15
  };
}
