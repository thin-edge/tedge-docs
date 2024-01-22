/*
  Plugin Cards List to display the official list of thin-edge.io plugins

  References
  * https://github.com/facebook/docusaurus/discussions/7708
*/
/* eslint-disable global-require */

import React from 'react';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Markdown from 'react-markdown';
import { Plugins, IPlugin } from '../../data/plugins';
import styles from './styles.module.css';

function getCategories() {
  const items = {};
  Plugins.forEach((item) => {
    if (item.tags) {
      item.tags.forEach((tag) => (items[tag] = null));
    }
  });
  return Object.keys(items).sort();
}

function PluginCard({
  name,
  sourceUrl = '',
  packageUrl = '',
  description = '',
  tags = [],
}: IPlugin) {
  const sourceRepoURL = sourceUrl || `https://github.com/thin-edge/${name}`;
  const packageRepoURL =
    packageUrl ||
    `https://cloudsmith.io/~thinedge/repos/community/packages/?q=name%3A%27%5E${name}%24%27`;
  return (
    <div className="col col--12 margin-bottom--lg">
      <div className={clsx('card')}>
        <div className="card__body">
          <div className="row">
            <Heading as="h3" id={name}>
              <span className="padding--sm">📦</span>
              {name}
            </Heading>
          </div>
          <div
            className={clsx('row', 'padding-left--md', 'padding-bottom--sm')}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="theme-doc-version-badge badge badge--secondary margin--xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <Markdown>{description}</Markdown>
        </div>
        <div className="card__footer">
          <div className="button-group button-group--block">
            <Link className="button button--secondary" to={sourceRepoURL}>
              Go to Repository
            </Link>
            <Link className="button button--secondary" to={packageRepoURL}>
              Go to Package
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PluginCardsListProps {
  tags: [];
}

const options = getCategories().map((item) => ({
  value: item,
  label: item,
}));

interface IKeywordOption {
  value: string;
}

interface ISearchOptions {
  text?: string;
  categoryOption?: IKeywordOption[];
}

function ThemedSelect({ options, onChange, defaultValue }) {
  // Match react-select with the docusaurus theme
  // Note: This is by no means perfect
  const colors = {
    neutral50: 'var(--ifm-font-color-base)',
    neutral40: 'var(--ifm-font-color-base)',
    neutral30: 'var(--ifm-font-color-base)',
    neutral20: 'var(--ifm-color-secondary-darkest)', // control outline
    neutral10: 'var(--ifm-color-emphasis-500)', // pill background
    neutral5: 'var(--ifm-font-color-base)',
    neutral0: 'var(--ifm-card-background-color)', // text background
    primary25: 'var(--ifm-color-primary)',
    primary50: 'var(--ifm-color-primary)',
    primary: 'var(--ifm-color-primary)',
    background: 'var(--ifm-card-background-color)',
    text: 'var(--ifm-font-color-base)',
    textFocused: 'var(--ifm-color-white)',
    textSelected: 'var(--ifm-color-white)',
    selected: 'var(--ifm-color-primary)',
  };

  const customStyles = {
    control: (styles, {}) => ({
      ...styles,
      height: 'var(--docsearch-searchbox-height)',
    }),
    input: (styles, {}) => ({
      ...styles,
      color: 'var(--ifm-font-color-base)',
    }),
    multiValue: (styles, {}) => ({
      ...styles,
      color: 'var(--ifm-color-black)',
      backgroundColor: 'var(--ifm-color-secondary)',
      borderRadius: 'var(--ifm-badge-border-radius)',
      fontWeight: 'var(--ifm-font-weight-bold)',
    }),
    placeholder: (styles, {}) => ({
      ...styles,
      color: 'var(--ifm-color-secondary-darkest)',
      fontSize: '1.2em',
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? data.color
            : isFocused
              ? colors.selected
              : undefined,
        color: isDisabled
          ? '#ccc'
          : isSelected
            ? colors.text
            : isFocused
              ? colors.textFocused
              : colors.text,
        cursor: isDisabled ? 'not-allowed' : 'default',

        ':active': {
          ...styles[':active'],
          backgroundColor: !isDisabled
            ? isSelected
              ? data.color
              : '#ddd'
            : '#fef',
        },
      };
    },
  };

  return (
    <Select
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          ...colors,
        },
      })}
      styles={customStyles}
      placeholder="Select Keywords..."
      isMulti
      defaultValue={defaultValue}
      onChange={onChange}
      options={options}
    />
  );
}

export function PluginCardsList({
  tags = [],
}: PluginCardsListProps): JSX.Element {
  const [APIData, setAPIData] = useState<IPlugin[]>([]);
  useEffect(() => {
    setAPIData(Plugins);
  }, []);

  const [filteredResults, setFilteredResults] = useState(Plugins);
  const [searchInput, setSearchInput] = useState('');
  const [selectOption, setSelectOption] = useState<IKeywordOption[]>([]);

  const searchItems = ({
    text = undefined,
    categoryOption = undefined,
  }: ISearchOptions) => {
    if (text != undefined) {
      setSearchInput(text);
    }

    if (categoryOption != undefined) {
      setSelectOption(categoryOption);
    }

    const filterByCategories = (
      categoryOption != undefined ? categoryOption : selectOption || []
    ).map((i) => i.value);
    const filterByText = text != undefined ? text : searchInput;

    const filteredData = APIData.filter((item) => {
      if (filterByCategories.length) {
        if (!item.tags) {
          return false;
        }
        const matchingTags = item.tags.filter((tag) =>
          filterByCategories.includes(tag),
        );
        if (matchingTags.length == 0) {
          return false;
        }
      }
      return (
        item.name
          .toLocaleLowerCase()
          .includes(filterByText.toLocaleLowerCase()) ||
        item.description
          .toLocaleLowerCase()
          .includes(filterByText.toLocaleLowerCase())
      );
    });
    setFilteredResults(filteredData);
  };

  return (
    <div>
      <div className="padding-bottom--sm">
        <ThemedSelect
          defaultValue={selectOption}
          onChange={(value) => searchItems({ categoryOption: [...value] })}
          options={options}
        />
      </div>
      <form
        className={clsx(
          'DocSearch',
          styles.pluginForm,
          styles.pluginTextSearch,
        )}
      >
        <label
          className="DocSearch-MagnifierLabel"
          style={{ color: 'var(--ifm-color-emphasis-500)' }}
        >
          <svg
            width="20"
            height="20"
            className="DocSearch-Search-Icon"
            viewBox="0 0 20 20"
          >
            <path
              d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
              stroke="currentColor"
              fill="none"
              fillRule="evenodd"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </label>
        <input
          value={searchInput}
          className={clsx('DocSearch-Input')}
          placeholder="Search plugins"
          onChange={(e) => searchItems({ text: e.target.value })}
        />
        {searchInput && (
          <button
            onClick={(_e) => searchItems({ text: '' })}
            type="reset"
            title="Clear the query"
            className={styles.searchReset}
            aria-label="Clear the query"
          >
            <svg
              height="20"
              width="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
            >
              <path
                stroke="none"
                fill="currentColor"
                d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
              ></path>
            </svg>
          </button>
        )}
      </form>
      <div className={clsx('row', 'padding-top--md')}>
        {filteredResults.map((plugin) => (
          <PluginCard key={plugin.name} {...plugin} />
        ))}
      </div>
    </div>
  );
}
