import buildValuePreview from '../valuePreview';

describe('valuePreview', function() {

  it('should preview context entries as keys', function() {

    // given
    const value = {
      entries: [
        { name: 'status' },
        { name: 'timestamp' },
      ],
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('{ status, timestamp }');
  });


  it('should elide context entries beyond the preview limit', function() {

    // given
    const value = {
      entries: [
        { name: 'status' },
        { name: 'timestamp' },
        { name: 'items' },
      ],
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('{ status, timestamp, … }');
  });


  it('should preview list entries as item count', function() {

    // given
    const value = {
      isList: true,
      entries: [
        { name: '0' },
        { name: '1' },
        { name: '2' },
      ],
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('[ 3 items ]');
  });


  it('should preview single-item list in singular', function() {

    // given
    const value = {
      isList: true,
      entries: [
        { name: '0' },
      ],
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('[ 1 item ]');
  });


  it('should preview FEEL expression as-is', function() {

    // given
    const value = {
      info: '= orderId',
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('= orderId');
  });


  it('should truncate long values', function() {

    // given
    const value = {
      info: `= ${'x'.repeat(50)}`,
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toHaveLength(41);
    expect(preview.endsWith('…')).toBe(true);
  });


  it('should preview plain value trimmed', function() {

    // given
    const value = {
      info: '  "CUS-4821"  ',
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('"CUS-4821"');
  });


  it('should preview Null type as null', function() {

    // given
    const value = {
      type: 'Null',
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('null');
  });


  it('should preview null info as null', function() {

    // given
    const value = {
      info: null,
    };

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('null');
  });


  it('should preview empty value as empty string', function() {

    // given
    const value = {};

    // when
    const preview = buildValuePreview(value);

    // then
    expect(preview).toBe('');
  });

});
