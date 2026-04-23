"""Inspect the actual byte sequence of 'â€' in the 019 title."""
with open('src/pages/journal/019.astro', 'rb') as f:
    data = f.read()

# Find the first 'title=' occurrence
idx = data.find(b'title=')
print(f'title= at offset {idx}')

# Print bytes from here forward until second quote closes
end = data.find(b'"', idx + 8) + 1
sample = data[idx:end]
print(f'Raw bytes ({len(sample)} chars):')
print(sample.hex(' '))
print()

# Highlight non-ASCII byte runs
print('Non-ASCII byte runs:')
i = 0
while i < len(sample):
    if sample[i] >= 0x80:
        j = i
        while j < len(sample) and sample[j] >= 0x80:
            j += 1
        run = sample[i:j]
        # Try decoding as utf-8 and as latin1
        try:
            utf8 = run.decode('utf-8')
        except:
            utf8 = '<invalid utf-8>'
        latin1 = run.decode('latin-1')
        print(f'  offset {i}: {run.hex(" ")} -> utf-8:{utf8!r} latin1:{latin1!r}')
        i = j
    else:
        i += 1
