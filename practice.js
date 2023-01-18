console.log("Started");
let arr = [10000001, 10000002, 10000003, 10000004];
let val1 = "1000000005",
  val2 = "1000000004";

let sumOfLarge = (first, second) => {
  let sum = "",
    carry = 0,
    diff = second.length - first.length;
  for (let i = first.length - 1; i >= 0; i--) {
    let temp =
      Number(first.charAt(i)) + Number(second.charAt(i + diff)) + carry;
    if (temp >= 10) {
      sum = (temp % 10) + sum;
      carry = Math.floor(temp / 10);
    } else {
      sum = temp + sum;
      carry = 0;
    }
  }
  if (carry) {
    sum = carry + sum;
  }
  return sum;
};

if (val1.length > val2.length) {
  console.log(sumOfLarge(val1, val2));
} else {
  console.log(sumOfLarge(val2, val1));
}
