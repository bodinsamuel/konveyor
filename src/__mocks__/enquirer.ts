export const prompt = jest.fn(obj => {
  if (obj.type === 'select') {
    return {
      [obj.name]: obj.choices[0].name,
    };
  } else if (obj.type === 'toggle') {
    return {
      [obj.name]: true,
    };
  }

  return {};
});
