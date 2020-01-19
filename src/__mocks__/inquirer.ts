export const prompt = jest.fn(obj => {
  if (obj[0].type === 'list') {
    return {
      [obj[0].name]: obj[0].choices[0],
    };
  } else if (obj[0].type === 'confirm') {
    return {
      [obj[0].name]: true,
    };
  }

  return {};
});
